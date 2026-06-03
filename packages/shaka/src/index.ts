import {
  loadSDK,
  PartialRequired,
  type Player,
  type PlayerPluginV2,
  type PluginMeta,
  type Source,
  type LoadSourceContext
} from '@oplayer/core'
//@ts-ignore
import type shaka from 'shaka-player'

const PLUGIN_NAME = 'shaka'

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

  /**
   *default: 'menu'
   */
  qualityControlType?: 'menu' | 'setting'

  qualityControl?: boolean

  audioControl?: boolean

  textControl?: boolean
}

const defaultMatcher: Matcher = (source) => {
  if (source.format && ['m3u8', 'mpd', 'shaka'].includes(source.format)) {
    return true
  }
  return (
    (source.format === 'auto' || typeof source.format === 'undefined') &&
    /(m3u8|mpd|shaka)(#|\?|$)/i.test(source.src)
  )
}

class ShakaPlugin implements PlayerPluginV2 {
  readonly meta: PluginMeta = { name: PLUGIN_NAME }
  static readonly pluginName = PLUGIN_NAME

  static library: typeof shaka

  private player!: Player

  instance?: shaka.Player & { eventManager: shaka.util.EventManager }

  options: PartialRequired<ShakaPluginOptions, 'matcher'> = {
    matcher: defaultMatcher,
    qualityControl: true,
    audioControl: true,
    textControl: true,
    qualityControlType: 'menu'
  }

  constructor(options?: ShakaPluginOptions) {
    Object.assign(this.options, options)
  }

  setup(ctx: Parameters<PlayerPluginV2['setup']>[0]) {
    this.player = ctx.player
    return this
  }

  async loadSource(ctx: LoadSourceContext) {
    if (!this.options.matcher(ctx.source)) return false

    const { library, config, requestFilter, qualityControl, audioControl, textControl, qualityControlType } =
      this.options
    const player = this.player

    if (!ShakaPlugin.library) {
      ShakaPlugin.library =
        (globalThis as any).shaka ||
        (library
          ? await loadSDK(library, 'shaka')
          : (await import('shaka-player/dist/shaka-player.compiled.js')).default)

      ShakaPlugin.library.polyfill.installAll()
    }

    const ShakaPlayer = ShakaPlugin.library.Player

    if (!ShakaPlayer.isBrowserSupported()) return false

    this.instance = new ShakaPlayer() as unknown as shaka.Player & {
      eventManager: shaka.util.EventManager
      timer: any
    }
    await this.instance.attach(ctx.video)

    if (config) {
      this.instance.configure(config)
    }

    if (requestFilter) {
      this.instance.getNetworkingEngine()?.registerRequestFilter(requestFilter)
    }

    const eventManager = (this.instance.eventManager = new ShakaPlugin.library.util.EventManager())

    eventManager.listen(this.instance, 'loading', (event) => {
      player.emit('loading', event)
    })

    eventManager.listen(this.instance, 'loaded', (event) => {
      player.emit('loaded', event)
    })

    eventManager.listen(this.instance, 'error', (event) => {
      player.emit('error', { pluginName: PLUGIN_NAME, ...event })
    })

    eventManager.listenOnce(ctx.video, 'seeking', () => {
      // ignore first seeking ?
      setTimeout(() => {
        player.emit('seeked')
      })
    })

    try {
      await this.instance.load(ctx.source.src)
    } catch (error: any) {
      player.emit('error', { pluginName: PLUGIN_NAME, ...error })
    }

    if (player.options.isLive) {
      eventManager.listenOnce(ctx.video, 'loadedmetadata', () => {
        ctx.video.currentTime = this.seekRange.end
      })

      const button = player.$root.querySelector('[aria-label="time"')?.parentElement
      const dot = button?.firstElementChild as HTMLSpanElement | undefined

      if (button && dot) {
        eventManager.listen(button, 'click', () => {
          ctx.video.currentTime = this.seekRange.end
        })

        const backText = player.locales.get('Back to Live')
        const updateIsLive = () => {
          const timeBehindLiveEdge = this.seekRange.end - ctx.video.currentTime
          if (timeBehindLiveEdge > 5) {
            dot.style.backgroundColor = '#ccc'
            button.ariaLabel = backText
          } else {
            dot.style.cssText = ''
            button.removeAttribute('aria-label')
          }
        }

        this.instance.eventManager.listen(ctx.video, 'timeupdate', updateIsLive)
      }

      Object.defineProperty(player, 'duration', {
        get: () => {
          if (this.instance) return this._duration
          return ctx.video.duration
        }
      })
      Object.defineProperty(player, 'currentTime', {
        get: () => {
          if (this.instance) return this.getCurrentTime()
          else return ctx.video.currentTime
        }
      })
      Object.defineProperty(player, 'seek', {
        value: (v: number) => {
          if (this.instance) ctx.video.currentTime = this.seekRange.start + v
          else ctx.video.currentTime = v
        }
      })
    }

    const ui = player.pluginManager.getPlugin<any>('ui') as any
    if (ui) {
      if (qualityControl) {
        this.setupQuality(player, this.instance, qualityControlType, ui)
      }

      if (audioControl) {
        this.setupAudioSelection(player, this.instance, ui)
      }

      if (textControl) {
        this.setupTextSelection(player, this.instance, ui)
      }
    }

    return this
  }

  getCurrentTime() {
    if (!this.instance) return 0
    const mediaElement = this.instance.getMediaElement()
    return mediaElement ? mediaElement.currentTime - this.seekRange.start : 0
  }

  get seekRange() {
    if (!this.instance) return { start: 0, end: 0 }
    return this.instance.seekRange()
  }

  get _duration() {
    if (!this.instance) return 0

    return this.seekRange.end - this.seekRange.start
  }

  async destroy() {
    const ui = this.player.pluginManager.getPlugin<any>('ui') as any
    if (ui?.setting) {
      ;['Quality', 'Language', 'Subtitle'].forEach((it) => ui.setting.unregister(`${PLUGIN_NAME}-${it}`))
    }
    if (ui?.menu) {
      ui.menu.unregister(`${PLUGIN_NAME}-${'Quality'}`)
    }
    this.instance?.eventManager.removeAll()
    await this.instance?.unload()
    await this.instance?.destroy()
    this.instance = undefined
  }

  setupQuality = (
    player: Player,
    instance: shaka.Player,
    qualityControlType: ShakaPluginOptions['qualityControlType'],
    ui: any
  ) => {
    let tracks: shaka.extern.Track[] = []

    if (instance.getLoadMode() != ShakaPlugin.library.Player.LoadMode.SRC_EQUALS) {
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
            ? this.getResolutionLabel_(t, tracks)
            : t.bandwidth
              ? Math.round(t.bandwidth / 1000) + ' kbits/s'
              : 'Unknown',
        default: !abrEnabled && t == selectedTrack,
        value: t
      }
    })

    const ctrl = qualityControlType == 'menu' ? ui.menu : ui.setting
    const autoText = player.locales.get('Auto')

    ctrl.unregister(`${PLUGIN_NAME}-Quality`)
    ctrl.register({
      icon: qualityControlType == 'setting' ? ui.icons.quality : undefined,
      name:
        qualityControlType == 'setting'
          ? 'Quality'
          : !abrEnabled && selectedTrack
            ? this.getResolutionLabel_(selectedTrack, [])
            : autoText,
      type: 'selector',
      key: `${PLUGIN_NAME}-Quality`,
      children: [
        {
          name: player.locales.get('Auto'),
          default: abrEnabled,
          value: -1
        }
      ].concat(settings as any),
      onChange: ({ value }: { value: shaka.extern.Track | -1 }, dom: HTMLButtonElement) => {
        const isAuto = value == -1
        instance.configure({ abr: { enabled: isAuto } })

        if (!isAuto) {
          dom.textContent = this.getResolutionLabel_(value, [])
          instance.selectVariantTrack(value, /* clearBuffer */ true)
        } else {
          dom.textContent = autoText
        }
      }
    })
  }

  setupAudioSelection = (player: Player, instance: shaka.Player, ui: any) => {
    const audioTracks = instance.getAudioTracks()

    if (!(audioTracks.length > 1)) return

    const levels = audioTracks
      .sort((a, b) => {
        return a.language.localeCompare(b.language)
      })
      .map((level) => {
        return {
          //@ts-ignore - optional method that may not exist
          name: `${level.language} ${ShakaPlugin.library.util.MimeUtils.getNormalizedCodec?.(level.codecs) || level.codecs}`,
          default: level.active,
          value: level
        }
      })
    this.settingUpdater({
      player,
      name: 'Language',
      icon: ui.icons.lang,
      settings: levels,
      onChange({ value }) {
        instance.selectAudioTrack(value)
      }
    })
  }

  setupTextSelection = (player: Player, instance: shaka.Player, ui: any) => {
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

    this.settingUpdater({
      player,
      name: 'Subtitle',
      icon: ui.icons.subtitle,
      settings: levels,
      onChange({ value }) {
        if (value != -1) instance.selectTextTrack(value)
        instance.setTextTrackVisibility(value != -1)
      }
    })
  }

  settingUpdater(arg: {
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
    const ui = player.pluginManager.getPlugin<any>('ui') as any

    ui.setting?.unregister(`${PLUGIN_NAME}-${name}`)
    ui.setting?.register({
      name: player.locales.get(name),
      icon,
      onChange,
      type: 'selector',
      key: `${PLUGIN_NAME}-${name}`,
      children: settings
    })
  }

  getResolutionLabel_(track: shaka.extern.Track, tracks: shaka.extern.Track[]) {
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

    if (hasDuplicateResolution && this.options.qualityControlType == 'setting') {
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
}

export default function create(options?: ShakaPluginOptions) {
  return new ShakaPlugin(options)
}
