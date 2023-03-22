import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

const PLUGIN_NAME = 'oplayer-plugin-dash'

type PluginOptions = {
  config?: MediaPlayerSettingClass
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
} & Options

type Options = {
  /**
   * enable quality control for the stream.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: immediate
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: true
   */
  audioControl?: boolean
  /**
   * @default: true
   */
  textControl?: boolean
  /**
   * @default: false
   */
  withBitrate?: boolean
}

const defaultMatcher: PluginOptions['matcher'] = (_, source) =>
  source.format === 'dash' ||
  source.format === 'mpd' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

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
        const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
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

const generateSetting = (player: Player, instance: MediaPlayerClass, options: Options) => {
  instance.on(DashPlugin.library.MediaPlayer.events.STREAM_INITIALIZED, function () {
    if (options.qualityControl) {
      settingUpdater({
        name: 'Quality',
        icon: player.plugins.ui.icons.quality,
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
          if (
            data.mediaType !== 'video' ||
            !instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video
          )
            return

          const height = instance.getBitrateInfoListFor('video')[data.newQuality]?.height
          const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
          player.plugins.ui?.setting.updateLabel(`${PLUGIN_NAME}-Quality`, levelName)
        }
      )
    }

    if (options.audioControl) {
      settingUpdater({
        name: 'Language',
        icon: player.plugins.ui.icons.lang,
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
        icon: player.plugins.ui.icons.subtitle,
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

    player.plugins.ui.setting.unregister(`${PLUGIN_NAME}-${name}`)
    player.plugins.ui.setting.register({
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
    player.plugins.ui?.setting.unregister(`${PLUGIN_NAME}-${it}`)
  )
}

class DashPlugin implements PlayerPlugin {
  key = 'dash'
  name = PLUGIN_NAME
  //@ts-ignore
  version = __VERSION__

  static defaultMatcher: PluginOptions['matcher'] = defaultMatcher

  player: Player

  //@ts-ignore
  static library: typeof import('dashjs') = globalThis.dashjs

  instance: MediaPlayerClass

  constructor(public options: PluginOptions) {}

  apply(player: Player) {
    this.player = player
  }

  async load({ $video }: Player, source: Source) {
    const { matcher = DashPlugin.defaultMatcher } = this.options

    if (!matcher!($video, source)) return false

    const {
      config,
      withBitrate = false,
      qualityControl = true,
      qualitySwitch = 'immediate',
      audioControl = true,
      textControl = true
    } = this.options

    DashPlugin.library ??= (await import('dashjs')).default

    if (!DashPlugin.library.supportsMediaSource()) return false

    this.instance = DashPlugin.library.MediaPlayer().create()

    const { instance, player } = this
    if (config) instance.updateSettings(config)
    instance.initialize(player.$video, source.src, player.$video.autoplay)

    if (!player.isNativeUI && player.plugins.ui?.setting) {
      generateSetting(player, instance, {
        qualityControl,
        qualitySwitch,
        withBitrate,
        audioControl,
        textControl
      })
    }

    instance.on(DashPlugin.library.MediaPlayer.events.ERROR, function (event: any) {
      const err = event.event || event.error
      const message = event.event ? event.event.message || event.type : undefined
      player.emit('error', { pluginName: PLUGIN_NAME, message, ...err })
    })

    return this
  }

  async unload() {
    removeSetting(this.player)
    this.instance.destroy()
  }

  async destroy() {
    await this.unload()
  }
}

export default function create(options: PluginOptions = {}): PlayerPlugin {
  return new DashPlugin(options)
}
