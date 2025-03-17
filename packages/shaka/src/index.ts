import { loadSDK, PartialRequired, type Player, type PlayerPlugin, type Source } from '@oplayer/core'
//@ts-ignore
import type Shaka from 'shaka-player'

export type Matcher = (source: Source) => boolean

export interface ShakaPluginOptions {
  library?: string

  matcher?: Matcher
  /**
   *shaka config
   * @type {object}
   */
  config?: any

  requestFilter?: shaka.extern.RequestFilter

  qualityControl?: boolean

  audioControl?: boolean

  textControl?: boolean
}

const defaultMatcher: Matcher = (source) => {
  if (source.format && ['m3u8', 'mdp', 'shaka'].includes(source.format)) {
    return true
  }
  return (
    (source.format === 'auto' || typeof source.format === 'undefined') &&
    /(m3u8|mdp|shaka)(#|\?|$)/i.test(source.src)
  )
}

class ShakaPlugin implements PlayerPlugin {
  key = 'shaka'
  name = 'oplayer-plugin-shaka'
  version = __VERSION__

  static library: typeof shaka

  player!: Player

  instance?: shaka.Player

  options: PartialRequired<ShakaPluginOptions, 'matcher'> = {
    matcher: defaultMatcher,
    qualityControl: true,
    audioControl: true,
    textControl: true
  }

  constructor(options?: ShakaPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load(player: Player, source: Source) {
    if (!this.options.matcher(source)) return false

    const { library, config, requestFilter, qualityControl, audioControl, textControl } = this.options

    if (!ShakaPlugin.library) {
      ShakaPlugin.library =
        (globalThis as any).shaka ||
        (library
          ? await loadSDK(library, 'shaka')
          : (await import('shaka-player/dist/shaka-player.compiled')).default)

      ShakaPlugin.library.polyfill.installAll()
    }

    const ShakaPlayer = ShakaPlugin.library.Player

    if (!ShakaPlayer.isBrowserSupported()) return false

    this.instance = new ShakaPlayer()
    await this.instance.attach(player.$video)

    if (config) {
      this.instance.configure(config)
    }

    if (requestFilter) {
      this.instance.getNetworkingEngine()?.registerRequestFilter(requestFilter)
    }

    // TODO: listen quality/audio/text change
    const eventManager = new ShakaPlugin.library.util.EventManager()

    eventManager.listen(this.instance, 'error', (event) => {
      player.emit('error', { pluginName: ShakaPlugin.name, ...event })
    })

    try {
      await this.instance.load(source.src)
    } catch (error: any) {
      player.emit('error', { pluginName: ShakaPlugin.name, ...error })
    }

    if (player.options.isLive) {
      player.$root.querySelector('[aria-label="time"')?.parentElement?.addEventListener('click', () => {
        player.seek(this.instance?.seekRange().end || 0)
      })
    }

    if (player.context.ui) {
      if (qualityControl) {
        setupQuality(player, this.instance)
        // eventManager.listen(this.instance, 'variantchanged', () => {})
        // eventManager.listen(this.instance, 'trackschanged', () => {})
      }

      if (audioControl) {
        setupAudioSelection(player, this.instance!)
        // eventManager.listen(this.instance, 'audiotrackschanged', () => {})
      }

      if (textControl) {
        setupTextSelection(player, this.instance!)
        // eventManager.listen(this.instance, 'texttrackvisibility', () => {})
        // eventManager.listen(this.instance, 'textchanged', (e) => {})
        // eventManager.listen(this.instance, 'trackschanged', () => {})
      }
    }

    return this
  }

  destroy() {
    ;['Quality', 'Language', 'Subtitle'].forEach((it) =>
      this.player.context.ui.setting.unregister(`${ShakaPlugin.name}-${it}`)
    )
    this.instance?.unload()
    this.instance?.destroy()
  }
}

export default function create(options?: ShakaPluginOptions) {
  return new ShakaPlugin(options)
}

const setupQuality = (player: Player, instance: shaka.Player) => {
  // https://github.com/shaka-project/shaka-player/blob/1f336dd319ad23a6feb785f2ab05a8bc5fc8e2a2/ui/resolution_selection.js#L90
  let tracks: shaka.extern.Track[] = []

  if (instance.getLoadMode() != shaka.Player.LoadMode.SRC_EQUALS) {
    tracks = instance.getVariantTracks()
  }

  const selectedTrack = tracks.find((track) => track.active)

  if (selectedTrack) {
    tracks = tracks.filter((track) => {
      if (track.language != selectedTrack.language) {
        return false
      }
      if (
        track.channelsCount &&
        selectedTrack.channelsCount &&
        track.channelsCount != selectedTrack.channelsCount
      ) {
        return false
      }
      if (JSON.stringify(track.audioRoles) != JSON.stringify(selectedTrack.audioRoles)) {
        return false
      }
      return true
    })
  }

  if (instance.isAudioOnly()) {
    tracks = tracks.filter((track, idx) => {
      return tracks.findIndex((t) => t.bandwidth == track.bandwidth) == idx
    })
  } else {
    const audiosIds = [...new Set(tracks.map((t) => t.audioId))].filter((t) => t !== null)

    if (audiosIds.length > 1) {
      tracks = tracks.filter((track, idx) => {
        const otherIdx = tracks.findIndex((t) => {
          const ret =
            t.height == track.height &&
            t.videoBandwidth == track.videoBandwidth &&
            t.frameRate == track.frameRate &&
            t.hdr == track.hdr &&
            t.videoLayout == track.videoLayout
          return ret
        })
        return otherIdx == idx
      })
    } else {
      tracks = tracks.filter((track, idx) => {
        const otherIdx = tracks.findIndex((t) => {
          const ret =
            t.height == track.height &&
            t.bandwidth == track.bandwidth &&
            t.frameRate == track.frameRate &&
            t.hdr == track.hdr &&
            t.videoLayout == track.videoLayout

          return ret
        })
        return otherIdx == idx
      })
    }
  }

  if (!(tracks.length > 1)) return

  if (instance.isAudioOnly()) {
    tracks.sort((t1, t2) => {
      return t2.bandwidth - t1.bandwidth
    })
  } else {
    tracks.sort((t1, t2) => {
      if (t2.height == t1.height || t1.height == null || t2.height == null) {
        return t2.bandwidth - t1.bandwidth
      }
      return t2.height - t1.height
    })
  }

  const abrEnabled = instance.getConfiguration().abr.enabled

  const settings = tracks.map((t) => {
    return {
      name:
        !instance.isAudioOnly() && t.height && t.width
          ? getResolutionLabel_(t, tracks)
          : t.bandwidth
            ? Math.round(t.bandwidth / 1000) + ' kbits/s'
            : 'Unknown',
      default: !abrEnabled && t == selectedTrack,
      value: t
    }
  })

  settingUpdater({
    player,
    name: 'Quality',
    icon: player.context.ui.icons.quality,
    settings: [
      {
        name: player.locales.get('Auto'),
        default: abrEnabled,
        value: -1
      }
    ].concat(settings as any),
    onChange({ value }) {
      const isAuto = value == -1
      instance.configure({ abr: { enabled: isAuto } })
      if (!isAuto) {
        instance.selectVariantTrack(value, /* clearBuffer */ true)
      } else {
        setupQuality(player, instance)
      }
    }
  })
}

const setupAudioSelection = (player: Player, instance: shaka.Player) => {
  const audioTracks = instance.getAudioTracks()

  if (!(audioTracks.length > 1)) return

  const levels = audioTracks
    .sort((a, b) => {
      return a.language.localeCompare(b.language)
    })
    .map((level) => {
      return {
        //@ts-expect-error
        name: `${level.language} ${ShakaPlugin.library.util.MimeUtils.getNormalizedCodec?.(level.codecs) || level.codecs}`,
        default: level.active,
        value: level
      }
    })
  settingUpdater({
    player,
    name: 'Language',
    icon: player.context.ui.icons.lang,
    settings: levels,
    onChange({ value }) {
      instance.selectAudioTrack(value)
    }
  })
}

const setupTextSelection = (player: Player, instance: shaka.Player) => {
  const tracks = instance.getTextTracks()

  if (!(tracks.length > 1)) return

  const isTextTrackVisible = instance.isTextTrackVisible()

  const levels = [
    {
      name: player.locales.get('Off'),
      default: !isTextTrackVisible,
      value: -1
    }
  ].concat(
    tracks
      .sort((a, b) => {
        return a.language.localeCompare(b.language)
      })
      .map((level) => {
        return {
          name: level.language,
          default: isTextTrackVisible && level.active,
          value: level
        }
      }) as any
  )

  settingUpdater({
    player,
    name: 'Subtitle',
    icon: player.context.ui.icons.lang,
    settings: levels,
    onChange({ value }) {
      if (value != -1) instance.selectTextTrack(value)
      instance.setTextTrackVisibility(value != -1)
    }
  })
}

function settingUpdater(arg: {
  icon: string
  name: string
  settings: {
    name: string
    default: boolean
    value: any
  }[]
  player: Player
  onChange: (it: { value: any }) => void
}) {
  const { name, icon, onChange, player, settings } = arg

  player.context.ui.setting.unregister(`${ShakaPlugin.name}-${name}`)
  player.context.ui.setting.register({
    name: player.locales.get(name),
    icon,
    onChange,
    type: 'selector',
    key: `${ShakaPlugin.name}-${name}`,
    children: settings
  })
}

function getResolutionLabel_(track: Shaka.extern.Track, tracks: Shaka.extern.Track[]) {
  const trackHeight = track.height || 0
  const trackWidth = track.width || 0
  let height = trackHeight
  const aspectRatio = trackWidth / trackHeight
  if (aspectRatio > 16 / 9) {
    height = Math.round((trackWidth * 9) / 16)
  }
  let text = height + 'p'
  if (height == 2160) {
    text = '4K'
  }
  const frameRates = new Set()
  for (const item of tracks) {
    if (item.frameRate) {
      frameRates.add(Math.round(item.frameRate))
    }
  }
  if (frameRates.size > 1) {
    const frameRate = track.frameRate
    if (frameRate && (frameRate >= 50 || frameRate <= 20)) {
      text += Math.round(frameRate)
    }
  }
  if (track.hdr == 'PQ' || track.hdr == 'HLG') {
    text += ' (HDR)'
  }
  if (track.videoLayout == 'CH-STEREO') {
    text += ' (3D)'
  }
  const hasDuplicateResolution = tracks.some((otherTrack) => {
    return otherTrack != track && otherTrack.height == track.height
  })
  if (hasDuplicateResolution) {
    const hasDuplicateBandwidth = tracks.some((otherTrack) => {
      return (
        otherTrack != track &&
        otherTrack.height == track.height &&
        (otherTrack.videoBandwidth || otherTrack.bandwidth) == (track.videoBandwidth || track.bandwidth)
      )
    })
    if (!hasDuplicateBandwidth) {
      const bandwidth = track.videoBandwidth || track.bandwidth
      text += ' (' + Math.round(bandwidth / 1000) + ' kbits/s)'
    }
  }
  return text
}
