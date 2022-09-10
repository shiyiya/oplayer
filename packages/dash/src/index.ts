import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaSettings } from 'dashjs'

//@ts-ignore
import qualitySvg from '../../hls/src/quality.svg?raw'

let importedDash: typeof import('dashjs')
const PLUGIN_NAME = 'oplayer-plugin-dash'

type dashPluginOptions = {
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  setting?: MediaSettings
}

const defaultMatcher: dashPluginOptions['matcher'] = (_, source) =>
  source.format === 'dash' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

const generateSetting = (player: Player, dashInstance: MediaPlayerClass) => {
  const settingUpdater = () => {
    const settingOptions = [
      {
        name: player.locales.get('Auto'),
        type: 'switcher',
        default: true, // 默认都是 auto ?
        value: -1
      }
    ]

    if (dashInstance.getBitrateInfoListFor('video').length > 1) {
      dashInstance.getBitrateInfoListFor('video').forEach((bitrate) => {
        const name = Math.floor(bitrate.bitrate / 1000)
        settingOptions.push({
          name: isNaN(bitrate.qualityIndex) ? 'Auto Switch' : (`${name} kbps` as string),
          type: 'switcher',
          default: false, // 默认都是 auto ?
          value: bitrate.qualityIndex
        })
      })
    }

    player.emit('removesetting', PLUGIN_NAME)
    player.emit('addsetting', {
      name: player.locales.get('Quality'),
      type: 'selector',
      key: PLUGIN_NAME,
      icon: qualitySvg,
      onChange: ({ value }: typeof settingOptions[number], { isInit }: any) => {
        if (!isInit) dashInstance.setQualityFor('video', value)
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
        dashInstance?.reset()
        return false
      }

      await getDash()

      if (!importedDash.supportsMediaSource()) return false

      dashInstance = importedDash.MediaPlayer().create()
      if (setting) dashInstance.setInitialMediaSettingsFor('video', setting)
      dashInstance.initialize(player.$video, source.src, player.$video.autoplay)
      generateSetting(player, dashInstance)

      Object.values(importedDash.MediaPlayer.events).forEach((eventName) => {
        dashInstance.on(eventName as any, (event) => {
          //@ts-ignore
          if (event.type === importedDash.MediaPlayer.events.ERROR) {
            player.emit('pluginerror', { message: event.type, ...event })
          }
          player.emit(event.type, event)
        })
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
