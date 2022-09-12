import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass } from 'dashjs'

//@ts-ignore
import qualitySvg from '../../hls/src/quality.svg?raw'

let importedDash: typeof import('dashjs')
const PLUGIN_NAME = 'oplayer-plugin-dash'

type dashPluginOptions = {
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  setting?: MediaPlayerSettingClass
}

const defaultMatcher: dashPluginOptions['matcher'] = (_, source) =>
  source.format === 'dash' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

const generateSetting = (player: Player, dashInstance: MediaPlayerClass) => {
  const settingUpdater = () => {
    const isAutoSwitch = dashInstance.getSettings().streaming?.abr?.autoSwitchBitrate?.video

    const settingOptions = [
      {
        name: player.locales.get('Auto'),
        type: 'switcher',
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
        const kb = bitrate.bitrate / 1000
        const useMb = kb > 1000
        const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
        settingOptions.push({
          name: `${bitrate.height}p (${number}${useMb ? 'm' : 'k'}bps)`,
          type: 'switcher',
          default: isAutoSwitch
            ? false
            : bitrate.qualityIndex == dashInstance.getQualityFor('video'),
          value: bitrate.qualityIndex as any
        })
      })
    }

    player.emit('removesetting', PLUGIN_NAME)
    player.emit('addsetting', {
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

  dashInstance.on(importedDash.MediaPlayer.events.STREAM_ACTIVATED, settingUpdater)
}

const dashPlugin = ({
  matcher = defaultMatcher,
  setting
}: dashPluginOptions = {}): PlayerPlugin => {
  let dashInstance: MediaPlayerClass

  const getDash = async () => {
    if (dashInstance) dashInstance.reset()
    importedDash ??= (await import('dashjs')).default
  }

  return {
    name: PLUGIN_NAME,
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (options.loader || !isMatch) {
        player.emit('removesetting', PLUGIN_NAME)
        dashInstance?.reset()
        return false
      }

      await getDash()

      if (!importedDash.supportsMediaSource()) return false

      dashInstance = importedDash.MediaPlayer().create()
      if (setting) dashInstance.updateSettings(setting)
      dashInstance.initialize(player.$video, source.src, player.$video.autoplay)
      generateSetting(player, dashInstance)

      Object.values(importedDash.MediaPlayer.events).forEach((eventName) => {
        //error 信息不会设置到target上 这里额外处理
        if (eventName == importedDash.MediaPlayer.events.ERROR) {
          dashInstance.on(importedDash.MediaPlayer.events.ERROR, (event) => {
            //@ts-ignore
            player.emit('error', { ...event.error, pluginName: PLUGIN_NAME })
          })
        } else {
          dashInstance.on(eventName as any, (event) => {
            player.emit(event.type, event)
          })
        }
      })

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        dashInstance?.reset()
        dashInstance = null as any
      })
    }
  }
}

export default dashPlugin
