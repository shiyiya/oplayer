import {
  loadSDK,
  type Player,
  type PlayerPluginV2,
  type PluginMeta,
  type RequiredPartial,
  type Source,
  type LoadSourceContext,
  type SettingRegistry,
  type SettingDefinition
} from '@oplayer/core'
import type {
  BitrateInfo,
  MediaPlayerClass,
  MediaPlayerSettingClass,
  ProtectionDataSet,
  QualityChangeRenderedEvent
} from 'dashjs'

const PLUGIN_NAME = 'dash'

export type Matcher = (video: HTMLVideoElement, source: Source) => boolean

export interface DashPluginOptions {
  library?: string
  matcher?: Matcher

  /**
   * default auto
   */
  defaultQuality?: (levels: BitrateInfo[]) => number

  /**
   * default browser language
   */
  defaultAudio?: (tracks: dashjs.MediaInfo[]) => number

  /**
   * default browser language
   */
  defaultSubtitle?: (tracks: dashjs.MediaInfo[]) => number

  /**
   * config for dashjs
   *
   * @type {MediaPlayerSettingClass}
   */
  config?: MediaPlayerSettingClass

  drm?: ProtectionDataSet

  /**
   * enable quality control for the stream, does not apply to the native (iPhone) clients.
   * @default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: immediate
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: false
   */
  withBitrate?: boolean
  /**
   * @default: true
   */
  audioControl?: boolean
  /**
   * @default: true
   */
  textControl?: boolean
}

const defaultMatcher: Matcher = (_, source) =>
  source.format === 'dash' ||
  source.format === 'mpd' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') && /.mpd(#|\?|$)/i.test(source.src))

class DashPlugin implements PlayerPluginV2 {
  readonly meta: PluginMeta = { name: PLUGIN_NAME }

  static library: typeof import('dashjs')

  private player!: Player
  private settings!: SettingRegistry

  instance?: MediaPlayerClass

  options: RequiredPartial<DashPluginOptions, 'config' | 'library' | 'drm'> = {
    textControl: true,
    audioControl: true,
    qualityControl: true,
    withBitrate: false,
    qualitySwitch: 'immediate',
    matcher: defaultMatcher,
    defaultQuality: () => -1,
    defaultAudio: () => -1,
    defaultSubtitle: () => -1
  }

  constructor(options?: DashPluginOptions) {
    Object.assign(this.options, options)
  }

  setup(ctx: Parameters<PlayerPluginV2['setup']>[0]) {
    this.player = ctx.player
    this.settings = ctx.settings
    return this
  }

  async loadSource(ctx: LoadSourceContext) {
    const { matcher, library } = this.options

    if (!matcher(ctx.video, ctx.source)) return false

    if (!DashPlugin.library) {
      DashPlugin.library =
        globalThis.dashjs || (library ? await loadSDK(library, 'dashjs') : (await import('dashjs')).default)
    }

    if (!DashPlugin.library.supportsMediaSource()) return false

    this.instance = DashPlugin.library.MediaPlayer().create()

    const { player, instance } = this
    const { drm, config } = this.options

    if (config) instance.updateSettings(config)
    if (drm) instance.setProtectionData(drm)
    instance.initialize(ctx.video, ctx.source.src, ctx.video.autoplay)

    instance.on(DashPlugin.library.MediaPlayer.events.ERROR, function (event: any) {
      const err = event.event || event.error
      const message = event.event ? event.event.message || event.type : undefined
      player.emit('error', { pluginName: PLUGIN_NAME, message, ...err })
    })

    if (typeof instance.getBitrateInfoListFor === 'function') {
      generateSetting(player, instance, this.settings, this.options)
    } else {
      console.warn('https://github.com/shiyiya/oplayer/issues/155')
    }

    return this
  }

  destroy() {
    if (this.instance) {
      const { instance } = this
      removeSetting(this.settings)
      instance.destroy()
    }
  }
}

function getSettingsByType(instance: MediaPlayerClass, type: 'video', withBitrate?: boolean) {
  const bitrateInfoList = instance.getBitrateInfoListFor(type)
  const isAuto = Boolean(instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video)
  const videoQuality = instance.getQualityFor('video')
  if (bitrateInfoList.length > 1) {
    return bitrateInfoList
      .toSorted((a, b) => b.bitrate - a.bitrate)
      .map((it) => {
        let name = it.height + 'p'

        if (withBitrate) {
          const kb = it.bitrate / 1000
          const useMb = kb > 1000
          const number = useMb ? (kb / 1000).toFixed(2) : Math.floor(kb)
          name += ` (${number}${useMb ? 'm' : 'k'}bps)`
        }

        return {
          name,
          default: isAuto ? false : videoQuality == it.qualityIndex,
          value: it.qualityIndex
        }
      })
  }

  return []
}

const generateSetting = (
  player: Player,
  instance: MediaPlayerClass,
  settings: SettingRegistry,
  options: DashPlugin['options']
) => {
  instance.on(DashPlugin.library.MediaPlayer.events.STREAM_INITIALIZED, function () {
    if (options.qualityControl) {
      const quality = instance.getBitrateInfoListFor('video')
      if (quality.length < 2) return

      const defaultLevel = options.defaultQuality(quality)
      if (defaultLevel != -1) instance.setQualityFor('video', defaultLevel)

      settingUpdater({
        name: 'Quality',
        settings: () =>
          [
            {
              name: player.locales.get('Auto'),
              default: Boolean(instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video),
              value: -1
            }
          ].concat(getSettingsByType(instance, 'video', options.withBitrate)),
        onChange({ value }) {
          const v = value as number
          instance.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: v == -1 } } }
          })
          if (v != -1) {
            instance.setQualityFor('video', v, options.qualitySwitch == 'immediate')
          }
        }
      })

      instance.on(
        DashPlugin.library.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
        function qualityMenuUpdater(data: QualityChangeRenderedEvent) {
          if (data.mediaType !== 'video' || !instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video)
            return

          const height = instance.getBitrateInfoListFor('video')[data.newQuality]?.height
          const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
          settings.updateLabel(`${PLUGIN_NAME}-Quality`, levelName)
        }
      )
    }

    if (options.audioControl) {
      const audioTracks = instance.getTracksFor('audio')
      if (audioTracks.length < 2) return

      let defaultAudio: number | undefined = options.defaultAudio(audioTracks)
      if (defaultAudio == -1) {
        defaultAudio = audioTracks.find(({ lang }) => {
          return lang === navigator.language || lang === navigator.language.split('-')[0]
        })?.id as unknown as number
      }

      if (defaultAudio != -1 && defaultAudio != undefined) {
        instance.setCurrentTrack(audioTracks.find((t) => (t.id as unknown as number) == defaultAudio)!)
      }

      const currentAudio = instance.getCurrentTrackFor('audio')

      settingUpdater({
        name: 'Language',
        settings() {
          return audioTracks.map((it) => ({
            name: it.lang || 'unknown',
            default: currentAudio?.index != null && currentAudio.index == it.index,
            value: it
          }))
        },
        onChange({ value }) {
          instance.setCurrentTrack(value as dashjs.MediaInfo)
        }
      })
    }

    if (options.textControl) {
      const textTracks = instance.getTracksFor('text')
      if (textTracks.length < 1) return

      let defaultSubtitle: number | undefined = options.defaultSubtitle(textTracks)
      if (defaultSubtitle == -1) {
        defaultSubtitle = textTracks.find(({ lang }) => {
          return lang === navigator.language || lang === navigator.language.split('-')[0]
        })?.id as unknown as number
      }

      if (defaultSubtitle != -1 && defaultSubtitle != undefined) {
        instance.enableText(true)
        instance.setTextTrack(defaultSubtitle)
      }

      const currentTrack = instance.getCurrentTrackFor('text')

      settingUpdater({
        name: 'Subtitle',
        settings() {
          return [
            {
              name: player.locales.get('Off'),
              default: !instance.isTextEnabled(),
              value: -1
            }
          ].concat(
            textTracks.map((it) => ({
              name: it.lang || 'unknown',
              default: currentTrack?.index != null && currentTrack.index == it.index,
              value: it.index!
            }))
          )
        },
        onChange({ value }) {
          const v = value as number
          instance.enableText(v != -1)
          if (v != -1) instance.setTextTrack(v)
        }
      })
    }
  })

  function settingUpdater(arg: {
    name: string
    settings: () => {
      name: string
      default: boolean
      value: unknown
    }[]
    onChange: SettingDefinition['onChange']
  }) {
    const settingsList = arg.settings()
    const { name, onChange } = arg

    settings.unregister(`${PLUGIN_NAME}-${name}`)
    settings.register({
      name: player.locales.get(name),
      onChange,
      type: 'selector',
      key: `${PLUGIN_NAME}-${name}`,
      children: settingsList
    })
  }
}

const removeSetting = (settings: SettingRegistry) => {
  settings.unregister(`${PLUGIN_NAME}-Quality`)
  settings.unregister(`${PLUGIN_NAME}-Language`)
  settings.unregister(`${PLUGIN_NAME}-Subtitle`)
}

export default function create(options?: DashPluginOptions) {
  return new DashPlugin(options)
}
