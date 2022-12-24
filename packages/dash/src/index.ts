import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

const PLUGIN_NAME = 'oplayer-plugin-dash'

let imported: typeof import('dashjs') = globalThis.dashjs

const languageIcon = `<svg viewBox="0 0 1024 1024"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m294.4 256H682.666667c-12.8-55.466667-34.133333-102.4-59.733334-153.6 76.8 29.866667 145.066667 81.066667 183.466667 153.6zM512 170.666667c34.133333 51.2 64 106.666667 81.066667 170.666666h-162.133334c17.066667-59.733333 46.933333-119.466667 81.066667-170.666666zM183.466667 597.333333c-8.533333-25.6-12.8-55.466667-12.8-85.333333s4.266667-59.733333 12.8-85.333333h145.066666c-4.266667 29.866667-4.266667 55.466667-4.266666 85.333333s4.266667 55.466667 4.266666 85.333333H183.466667z m34.133333 85.333334H341.333333c12.8 55.466667 34.133333 102.4 59.733334 153.6-76.8-29.866667-145.066667-81.066667-183.466667-153.6zM341.333333 341.333333H217.6c42.666667-72.533333 106.666667-123.733333 183.466667-153.6C375.466667 238.933333 354.133333 285.866667 341.333333 341.333333z m170.666667 512c-34.133333-51.2-64-106.666667-81.066667-170.666666h162.133334c-17.066667 59.733333-46.933333 119.466667-81.066667 170.666666z m98.133333-256H413.866667c-4.266667-29.866667-8.533333-55.466667-8.533334-85.333333s4.266667-55.466667 8.533334-85.333333h200.533333c4.266667 29.866667 8.533333 55.466667 8.533333 85.333333s-8.533333 55.466667-12.8 85.333333z m12.8 238.933334c25.6-46.933333 46.933333-98.133333 59.733334-153.6h123.733333c-38.4 72.533333-106.666667 123.733333-183.466667 153.6z m76.8-238.933334c4.266667-29.866667 4.266667-55.466667 4.266667-85.333333s-4.266667-55.466667-4.266667-85.333333h145.066667c8.533333 25.6 12.8 55.466667 12.8 85.333333s-4.266667 59.733333-12.8 85.333333h-145.066667z"></path></svg>`

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

const defaultMatcher: PluginOptions['matcher'] = (_, source) =>
  source.format === 'mpd' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

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
          icon: languageIcon,
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
                name: player.locales.get('Close'),
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
      }

      if (options.loader || !isMatch) return false

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

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        instance?.destroy()
        instance = null
      })

      return {
        value: () => instance,
        constructor: () => imported
      }
    }
  }
}

export default plugin
