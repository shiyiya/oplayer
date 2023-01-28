import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

const PLUGIN_NAME = 'oplayer-plugin-dash'

let imported: typeof import('dashjs') = globalThis.dashjs

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

interface SettingItem {
  name: string
  default: boolean
  value: any
}

function getSettingsByType(instance: MediaPlayerClass, type: 'video', withBitrate?: boolean) {
  const bitrateInfoList = instance.getBitrateInfoListFor(type)
  const isAuto = Boolean(instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video)
  const videoQuality = instance.getQualityFor('video')
  if (bitrateInfoList.length > 1) {
    return bitrateInfoList.map<SettingItem>((it) => {
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
  instance.on(imported.MediaPlayer.events.STREAM_INITIALIZED, function () {
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
        imported.MediaPlayer.events.QUALITY_CHANGE_RENDERED,
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
          return instance.getTracksFor('audio').map<SettingItem>((it) => ({
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
          const ex = instance.getTracksFor('text').map<SettingItem>((it) => ({
            name: it.lang || 'unknown',
            default: instance.getCurrentTrackFor('text')?.id == it.id,
            value: it.id
          }))
          if (ex.length) {
            ex.unshift({
              name: player.locales.get('Off'),
              default: !instance.isTextEnabled(),
              value: -1
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
    settings: () => SettingItem[]
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

const plugin = ({
  config,
  withBitrate = false,
  qualityControl = true,
  qualitySwitch = 'immediate',
  audioControl = true,
  textControl = true,
  matcher = defaultMatcher
}: PluginOptions = {}): PlayerPlugin => {
  let instance: MediaPlayerClass | null
  let instanceDestroy: MediaPlayerClass['destroy'] | null

  function tryDestroy(player: Player) {
    if (instance) {
      removeSetting(player)
      instanceDestroy?.call(instance)
      instanceDestroy = null
      instance = null
    }
  }

  return {
    name: PLUGIN_NAME,
    key: 'dash',
    load: async (player, source) => {
      if (!matcher(player.$video, source)) return false

      imported ??= (await import('dashjs')).default

      if (!imported.supportsMediaSource()) return false

      instance = imported.MediaPlayer().create()
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

      instance.on(imported.MediaPlayer.events.ERROR, (event: any) => {
        const err = event.event || event.error
        const message = event.event ? event.event.message || event.type : undefined
        player.emit('error', { pluginName: PLUGIN_NAME, message, ...err })
      })

      instanceDestroy = instance.destroy
      instance.destroy = () => {
        tryDestroy(player)
      }

      return instance
    },
    apply: (player) => {
      player.on('destroy', () => {
        tryDestroy(player)
      })

      return () => imported
    }
  }
}

export default plugin
