import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass, QualityChangeRenderedEvent } from 'dashjs'

//@ts-ignore
import qualitySvg from '../../hls/src/quality.svg?raw'

const PLUGIN_NAME = 'oplayer-plugin-dash'

//@ts-ignore
let importedDash: typeof import('dashjs') = globalThis.dashjs

type dashPluginOptions = {
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  setting?: MediaPlayerSettingClass
  options?: {
    /**
     * @default: false
     */
    withBitrate?: boolean
    onActive?: (instance: MediaPlayerClass) => void | Function
  }
}

const defaultMatcher: dashPluginOptions['matcher'] = (_, source) =>
  source.format === 'dash' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

const generateSetting = (
  player: Player,
  dashInstance: MediaPlayerClass,
  options: dashPluginOptions['options']
) => {
  const settingUpdater = () => {
    const isAutoSwitch = dashInstance.getSettings().streaming?.abr?.autoSwitchBitrate?.video

    const settingOptions = [
      {
        name: player.locales.get('Auto'),
        default: isAutoSwitch,
        value: () => {
          dashInstance.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: true } } }
          })
        }
      }
    ]

    if (dashInstance.getBitrateInfoListFor('video').length > 1) {
      dashInstance.getBitrateInfoListFor('video').forEach((bitrate) => {
        let name = bitrate.height + 'p'
        if (options?.withBitrate) {
          const kb = bitrate.bitrate / 1000
          const useMb = kb > 1000
          const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
          name += ` (${number}${useMb ? 'm' : 'k'}bps)`
        }

        settingOptions.push({
          name,
          default: isAutoSwitch
            ? false
            : bitrate.qualityIndex == dashInstance.getQualityFor('video'),
          value: bitrate.qualityIndex as any
        })
      })
    }
    player.plugins.ui?.setting.unregister(PLUGIN_NAME)
    player.plugins.ui?.setting.register({
      name: player.locales.get('Quality'),
      type: 'selector',
      key: PLUGIN_NAME,
      icon: qualitySvg,
      onChange: ({ value }: typeof settingOptions[number]) => {
        if (typeof value == 'function') {
          value()
        } else {
          dashInstance.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: false } } }
          })
          dashInstance.setQualityFor('video', value)
        }
      },
      children: settingOptions
    })
  }

  const menuUpdater = (data: QualityChangeRenderedEvent) => {
    const settings = dashInstance.getSettings()
    if (data.mediaType !== 'video' && !settings.streaming?.abr?.autoSwitchBitrate?.video) return

    const level = dashInstance.getQualityFor('video')
    const height = dashInstance.getBitrateInfoListFor('video')[level]?.height
    const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
    player.emit('updatesettinglabel', { name: levelName, key: PLUGIN_NAME })
  }

  dashInstance.on(importedDash.MediaPlayer.events.STREAM_ACTIVATED, settingUpdater)
  dashInstance.on(importedDash.MediaPlayer.events.QUALITY_CHANGE_RENDERED, menuUpdater)
}

const dashPlugin = ({
  matcher = defaultMatcher,
  setting,
  options: pluginOptions
}: dashPluginOptions = {}): PlayerPlugin => {
  let dashInstance: MediaPlayerClass
  let inActive: Function | void

  const getDash = async () => {
    if (dashInstance) dashInstance.reset()
    importedDash ??= (await import('dashjs')).default
  }

  return {
    name: PLUGIN_NAME,
    key: 'dash',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (options.loader || !isMatch) {
        player.plugins.ui?.setting.unregister(PLUGIN_NAME)
        dashInstance?.reset()
        inActive?.()
        return false
      }

      await getDash()

      if (!importedDash.supportsMediaSource()) return false

      dashInstance = importedDash.MediaPlayer().create()
      if (setting) dashInstance.updateSettings(setting)
      dashInstance.initialize(player.$video, source.src, player.$video.autoplay)
      if (!player.isNativeUI) generateSetting(player, dashInstance, pluginOptions)

      dashInstance.on(importedDash.MediaPlayer.events.ERROR, (event: any) => {
        const err = event.event || event.error
        const message = event.event ? event.event.message || event.type : undefined
        player.emit('error', { pluginName: PLUGIN_NAME, message, ...err })
      })

      inActive = pluginOptions?.onActive?.(dashInstance)

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        dashInstance?.reset()
        dashInstance = null as any
      })

      return {
        value: () => dashInstance,
        constructor: importedDash
      }
    }
  }
}

export default dashPlugin
