import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

const PLUGIN_NAME = 'oplayer-plugin-dash'

let imported: typeof import('dashjs') = globalThis.dashjs

type PluginOptions = {
  options?: Options
  config?: MediaPlayerSettingClass
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

type Options = {
  /**
   * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: smooth
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: false
   */
  withBitrate?: boolean
}

const defaultMatcher: PluginOptions['matcher'] = (_, source) =>
  source.format === 'mpd' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

const generateSetting = (player: Player, instance: MediaPlayerClass, options: Options) => {
  const settingUpdater = () => {
    const isAutoSwitch = instance.getSettings().streaming?.abr?.autoSwitchBitrate?.video

    const settingOptions = [
      {
        name: player.locales.get('Auto'),
        default: isAutoSwitch,
        value: () => {
          instance.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: true } } }
          })
        }
      }
    ]

    if (instance.getBitrateInfoListFor('video').length > 1) {
      instance.getBitrateInfoListFor('video').forEach((bitrate) => {
        let name = bitrate.height + 'p'
        if (options.withBitrate) {
          const kb = bitrate.bitrate / 1000
          const useMb = kb > 1000
          const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
          name += ` (${number}${useMb ? 'm' : 'k'}bps)`
        }

        settingOptions.push({
          name,
          default: isAutoSwitch ? false : bitrate.qualityIndex == instance.getQualityFor('video'),
          value: bitrate.qualityIndex as any
        })
      })
    }
    player.plugins.ui.setting.unregister(PLUGIN_NAME)
    player.plugins.ui.setting.register({
      name: player.locales.get('Quality'),
      type: 'selector',
      key: PLUGIN_NAME,
      icon: player.plugins.ui.icons.quality,
      onChange: ({ value }: typeof settingOptions[number]) => {
        if (typeof value == 'function') {
          value()
        } else {
          instance.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: false } } }
          })
          instance.setQualityFor('video', value, options.qualitySwitch == 'immediate')
        }
      },
      children: settingOptions
    })
  }

  const menuUpdater = (data: QualityChangeRenderedEvent) => {
    const settings = instance.getSettings()
    if (data.mediaType !== 'video' || !settings.streaming?.abr?.autoSwitchBitrate?.video) return

    const level = instance.getQualityFor('video')
    const height = instance.getBitrateInfoListFor('video')[level]?.height
    const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
    player.plugins.ui?.setting.updateLabel(PLUGIN_NAME, levelName)
  }

  instance.on(imported.MediaPlayer.events.STREAM_ACTIVATED, settingUpdater)
  instance.on(imported.MediaPlayer.events.QUALITY_CHANGE_RENDERED, menuUpdater)
}

const plugin = ({
  config,
  options: _pluginOptions = {},
  matcher = defaultMatcher
}: PluginOptions = {}): PlayerPlugin => {
  let instance: MediaPlayerClass | null

  const pluginOptions: PluginOptions['options'] = {
    qualityControl: true,
    qualitySwitch: 'smooth',
    ..._pluginOptions
  }

  return {
    name: PLUGIN_NAME,
    key: 'dash',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (instance) {
        player.plugins.ui?.setting.unregister(PLUGIN_NAME)
        instance.destroy()
        instance = null
      }

      if (options.loader || !isMatch) return false

      imported ??= (await import('dashjs')).default

      if (!imported.supportsMediaSource()) return false

      instance = imported.MediaPlayer().create()
      if (config) instance.updateSettings(config)
      instance.initialize(player.$video, source.src, player.$video.autoplay)
      if (!player.isNativeUI) generateSetting(player, instance, pluginOptions)

      if (!player.isNativeUI && pluginOptions.qualityControl && player.plugins.ui?.setting) {
        generateSetting(player, instance, pluginOptions)
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
