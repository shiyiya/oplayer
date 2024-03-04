import type { Player, PlayerPlugin, RequiredPartial, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

const PLUGIN_NAME = 'oplayer-plugin-dash'

export type Matcher = (video: HTMLVideoElement, source: Source) => boolean

// active inactive
export type Active = (instance: MediaPlayerClass, library: typeof import('dashjs')) => void

export interface DashPluginOptions {
  matcher?: Matcher
  active?: Active
  inactive?: Active
  /**
   * config for dashjs
   *
   * @type {MediaPlayerSettingClass}
   */
  config?: MediaPlayerSettingClass

  // qualityLabelBuilder?: (instance: MediaPlayerClass) => {
  //   name: string
  //   default: boolean
  //   value: any
  // }[]

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

class DashPlugin implements PlayerPlugin {
  key = 'dash'
  name = PLUGIN_NAME
  version = __VERSION__

  static library: typeof import('dashjs')

  player!: Player

  instance?: MediaPlayerClass

  options: RequiredPartial<DashPluginOptions, 'active' | 'inactive' | 'config'> = {
    textControl: true,
    audioControl: true,
    qualityControl: true,
    withBitrate: false,
    qualitySwitch: 'immediate',
    matcher: defaultMatcher
  }

  constructor(options?: DashPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load({ $video }: Player, source: Source) {
    const { matcher } = this.options

    if (!matcher($video, source)) return false

    DashPlugin.library ??= (await import('dashjs')).default

    if (!DashPlugin.library.supportsMediaSource()) return false

    this.instance = DashPlugin.library.MediaPlayer().create()

    const { player, instance } = this
    const { config, active } = this.options

    if (active) {
      active(instance, DashPlugin.library)
    }

    if (config) instance.updateSettings(config)
    instance.initialize($video, source.src, $video.autoplay)

    instance.on(DashPlugin.library.MediaPlayer.events.ERROR, function (event: any) {
      const err = event.event || event.error
      const message = event.event ? event.event.message || event.type : undefined
      player.emit('error', { pluginName: PLUGIN_NAME, message, ...err })
    })

    if (player.context.ui?.setting) {
      generateSetting(player, instance, this.options)
    }

    return this
  }

  destroy() {
    if (this.instance) {
      // prettier-ignore
      const { player, instance, options: { inactive } } = this
      if (inactive) inactive(instance, DashPlugin.library)
      if (player.context.ui?.setting) removeSetting(player)
      instance.destroy()
    }
  }
}

DashPlugin.library = globalThis.dashjs

function getSettingsByType(instance: MediaPlayerClass, type: 'video', withBitrate?: boolean) {
  const bitrateInfoList = instance.getBitrateInfoListFor(type)
  const isAuto = Boolean(instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video)
  const videoQuality = instance.getQualityFor('video')
  if (bitrateInfoList.length > 1) {
    return bitrateInfoList.map((it) => {
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

const generateSetting = (player: Player, instance: MediaPlayerClass, options: DashPluginOptions) => {
  instance.on(DashPlugin.library.MediaPlayer.events.STREAM_INITIALIZED, function () {
    if (options.qualityControl) {
      settingUpdater({
        name: 'Quality',
        icon: player.context.ui.icons.quality,
        settings() {
          const ex = getSettingsByType(instance, 'video', options.withBitrate)

          if (ex.length) {
            ex.unshift({
              name: player.locales.get('Auto'),
              default: Boolean(instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video),
              value: -1
            })
          }

          return ex
        },
        onChange({ value }) {
          instance.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: value == -1 } } }
          })
          if (value != -1) {
            instance.setQualityFor('video', value, options.qualitySwitch == 'immediate')
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
          player.context.ui?.setting.updateLabel(`${PLUGIN_NAME}-Quality`, levelName)
        }
      )
    }

    if (options.audioControl) {
      settingUpdater({
        name: 'Language',
        icon: player.context.ui.icons.lang,
        settings() {
          return instance.getTracksFor('audio').map((it) => ({
            name: it.lang || 'unknown',
            default: instance.getCurrentTrackFor('audio')?.id == it.id,
            value: it
          }))
        },
        onChange({ value }) {
          instance.setCurrentTrack(value)
        }
      })
    }

    if (options.textControl) {
      settingUpdater({
        name: 'Subtitle',
        icon: player.context.ui.icons.subtitle,
        settings() {
          const ex = instance.getTracksFor('text').map((it) => ({
            name: it.lang || 'unknown',
            default: instance.getCurrentTrackFor('text')?.id == it.id,
            value: it.id
          }))
          if (ex.length) {
            ex.unshift({
              name: player.locales.get('Off'),
              default: !instance.isTextEnabled(),
              value: -1 as any
            })
          }
          return ex
        },
        onChange({ value }) {
          instance.enableText(value != -1)
          if (value != -1) instance.setTextTrack(value)
        }
      })
    }
  })

  function settingUpdater(arg: {
    icon: string
    name: string
    settings: () => {
      name: string
      default: boolean
      value: any
    }[]
    onChange: (it: { value: any }) => void
  }) {
    const settings = arg.settings()
    if (settings.length < 2) return

    const { name, icon, onChange } = arg

    player.context.ui.setting.unregister(`${PLUGIN_NAME}-${name}`)
    player.context.ui.setting.register({
      name: player.locales.get(name),
      icon,
      onChange,
      type: 'selector',
      key: `${PLUGIN_NAME}-${name}`,
      children: settings
    })
  }
}

const removeSetting = (player: Player) => {
  ;['Quality', 'Language', 'Subtitle'].forEach((it) =>
    player.context.ui.setting.unregister(`${PLUGIN_NAME}-${it}`)
  )
}

export default function create(options?: DashPluginOptions): PlayerPlugin {
  return new DashPlugin(options)
}
