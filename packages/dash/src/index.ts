import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

const PLUGIN_NAME = 'oplayer-plugin-dash'

//@ts-ignore
let imported: typeof import('dashjs') = globalThis.dashjs

type PluginOptions = {
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  setting?: MediaPlayerSettingClass
  options?: {
    /**
     * @default: false
     */
    withBitrate?: boolean
  }
}

const defaultMatcher: PluginOptions['matcher'] = (_, source) =>
  source.format === 'mpd' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

const generateSetting = (
  player: Player,
  instance: MediaPlayerClass,
  options: PluginOptions['options']
) => {
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
        if (options?.withBitrate) {
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
    player.plugins.ui?.setting.unregister(PLUGIN_NAME)
    player.plugins.ui?.setting.register({
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
          instance.setQualityFor('video', value)
        }
      },
      children: settingOptions
    })
  }

  const menuUpdater = (data: QualityChangeRenderedEvent) => {
    const settings = instance.getSettings()
    if (data.mediaType !== 'video' && !settings.streaming?.abr?.autoSwitchBitrate?.video) return

    const level = instance.getQualityFor('video')
    const height = instance.getBitrateInfoListFor('video')[level]?.height
    const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
    player.emit('updatesettinglabel', { name: levelName, key: PLUGIN_NAME })
  }

  instance.on(imported.MediaPlayer.events.STREAM_ACTIVATED, settingUpdater)
  instance.on(imported.MediaPlayer.events.QUALITY_CHANGE_RENDERED, menuUpdater)
}

const dashPlugin = ({
  matcher = defaultMatcher,
  setting,
  options: pluginOptions
}: PluginOptions = {}): PlayerPlugin => {
  let instance: MediaPlayerClass | null

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

      if (options.loader || !isMatch) {
        return false
      }

      imported ??= (await import('dashjs')).default

      if (!imported.supportsMediaSource()) return false

      instance = imported.MediaPlayer().create()

      if (source.drm?.drmType == 'widevine') {
        instance.setProtectionData({
          'com.widevine.alpha': {
            serverURL: source.drm!.license,
            priority: 0
          }
        })
        instance.getProtectionController().setRobustnessLevel('SW_SECURE_CRYPTO')
      }

      if (setting) instance.updateSettings(setting)
      instance.initialize(player.$video, source.src, player.$video.autoplay)
      if (!player.isNativeUI) generateSetting(player, instance, pluginOptions)

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

export default dashPlugin
