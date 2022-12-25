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
   * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: immediate
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  audioControl?: boolean
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
        default: Boolean(instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video)
          ? false
          : instance.getTopBitrateInfoFor(type).qualityIndex == it.qualityIndex,
        value: it.qualityIndex
      }
    })
  }

  return []
}

const generateSetting = (player: Player, instance: MediaPlayerClass, options: Options) => {
  if (options.qualityControl) {
    instance.on(imported.MediaPlayer.events.STREAM_INITIALIZED, function () {
      settingUpdater({
        name: player.locales.get('Quality'),
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

      if (options.audioControl) {
        settingUpdater({
          name: player.locales.get('Language'),
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
          name: player.locales.get('Subtitle'),
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
  }

  instance.on(imported.MediaPlayer.events.QUALITY_CHANGE_RENDERED, qualityMenuUpdater)

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
      name,
      icon,
      onChange,
      type: 'selector',
      key: `${PLUGIN_NAME}-${name}`,
      children: settings
    })
  }

  function qualityMenuUpdater(data: QualityChangeRenderedEvent) {
    const settings = instance.getSettings()
    if (data.mediaType !== 'video' || !settings.streaming?.abr?.autoSwitchBitrate?.video) return

    const level = instance.getQualityFor('video')
    const height = instance.getBitrateInfoListFor('video')[level]?.height
    const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
    player.plugins.ui?.setting.updateLabel(`${PLUGIN_NAME}-video`, levelName)
  }
}

const removeSetting = (player: Player) => {
  ;[
    player.locales.get('Quality'),
    player.locales.get('Language'),
    player.locales.get('Subtitle')
  ].forEach((it) => player.plugins.ui?.setting.unregister(`${PLUGIN_NAME}-${it}`))
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

  return {
    name: PLUGIN_NAME,
    key: 'dash',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (instance) {
        removeSetting(player)
        instance.destroy()
        instance = null
        player.loader = null
      }

      if (options.loader || !isMatch) return false

      imported ??= (await import('dashjs')).default

      if (!imported.supportsMediaSource()) return false

      instance = imported.MediaPlayer().create()
      if (config) instance.updateSettings(config)
      instance.initialize(player.$video, source.src, player.$video.autoplay)
      player.loader = instance

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

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        instance?.destroy()
        instance = null
      })

      return () => imported
    }
  }
}

plugin.prototype.defaultMatcher = defaultMatcher

export default plugin
