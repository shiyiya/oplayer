import type { PlayerPlugin, Source } from '@oplayer/core'
import type Mpegts from 'mpegts.js'

const PLUGIN_NAME = 'oplayer-plugin-mpegts'

//@ts-ignore
let imported: typeof Mpegts = globalThis.mpegts

type PluginOptions = {
  mpegtsConfig?: Partial<Mpegts.Config> & { debug: boolean }
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

const REG = /flv|ts|m2ts(#|\?|$)/i

const defaultMatcher: PluginOptions['matcher'] = (_, source) => {
  if (source.format && ['flv', 'm2ts', 'mpegts'].includes(source.format)) {
    return true
  }

  if (source.format === 'auto' || typeof source.format === 'undefined') {
    return REG.test(source.src)
  }

  return false
}

const plugin = (options: PluginOptions): PlayerPlugin => {
  const { mpegtsConfig, matcher = defaultMatcher } = options || {}
  let instance: Mpegts.Player | null

  return {
    name: PLUGIN_NAME,
    key: 'mpegts',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (instance) {
        instance.destroy()
        instance = null as any
      }

      if (options.loader || !isMatch) return false

      if (!imported) {
        //@ts-ignore
        imported = (await import('mpegts.js/dist/mpegts.js')).default
        imported.LoggingControl.enableAll = Boolean(mpegtsConfig?.debug)
      }

      if (!imported.isSupported()) return false

      instance = imported.createPlayer(
        {
          url: source.src,
          isLive: player.options.isLive,
          type: source.format || REG.exec(source.src)?.[0]! // could also be mpegts, m2ts, flv
        },
        mpegtsConfig
      )

      instance.attachMediaElement(player.$video)
      instance.load()

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        instance?.destroy()
        instance = null as any
      })

      return {
        value: () => instance,
        constructor: () => imported
      }
    }
  }
}

export default plugin
