import type { PlayerPlugin, Source } from '@oplayer/core'
import type { MediaPlayerClass, MediaPlayerSettingClass } from 'dashjs'

let importedHls: typeof import('dashjs')
const PLUGIN_NAME = 'oplayer-plugin-dash'

type dashPluginOptions = {
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  setting?: MediaPlayerSettingClass
}

const defaultMatcher: dashPluginOptions['matcher'] = (_, source) =>
  source.format === 'dash' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))

const dashPlugin = ({
  matcher = defaultMatcher,
  setting
}: dashPluginOptions = {}): PlayerPlugin => {
  let dashInstance: MediaPlayerClass

  const getDash = async () => {
    if (dashInstance) dashInstance.reset()
    importedHls ??= (await import('dashjs')).default
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

      if (!importedHls.supportsMediaSource()) return false

      dashInstance = importedHls.MediaPlayer().create()
      dashInstance.initialize(player.$video, source.src, player.$video.autoplay)
      if (setting) dashInstance.updateSettings(setting)

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
