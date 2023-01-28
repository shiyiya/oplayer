import type { PlayerPlugin, Source } from '@oplayer/core'
import type Mpegts from 'mpegts.js'

const PLUGIN_NAME = 'oplayer-plugin-mpegts'

//@ts-ignore
let imported: typeof Mpegts = globalThis.mpegts

type Options = {
  config?: Partial<Mpegts.Config>
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

const REG = /flv|ts|m2ts(#|\?|$)/i

const defaultMatcher: Options['matcher'] = (_, source) => {
  if (source.format && ['flv', 'm2ts', 'mpegts'].includes(source.format)) {
    return true
  }

  return (source.format === 'auto' || typeof source.format === 'undefined') && REG.test(source.src)
}

const plugin = (options?: Options): PlayerPlugin => {
  const { config, matcher = defaultMatcher } = options || {}
  let instance: Mpegts.Player | null
  let instanceDestroy: Mpegts.Player['destroy'] | null

  function tryDestroy() {
    if (instance) {
      instanceDestroy?.call(instance)
      instanceDestroy = null
      instance = null
    }
  }

  return {
    name: PLUGIN_NAME,
    key: 'mpegts',
    load: async (player, source) => {
      if (!matcher(player.$video, source)) return false

      if (!imported) {
        //@ts-ignore
        imported = (await import('mpegts.js/dist/mpegts.js')).default
        // imported.LoggingControl.enableAll = Boolean(config?.debug)
      }

      if (!imported.isSupported()) return false

      instance = imported.createPlayer(
        {
          url: source.src,
          isLive: player.options.isLive,
          type: source.format || REG.exec(source.src)?.[0]! // could also be mpegts, m2ts, flv
        },
        config
      )
      instance.attachMediaElement(player.$video)
      instance.load()

      instanceDestroy = instance.destroy
      instance.destroy = () => {
        tryDestroy()
      }

      return instance
    },
    apply: (player) => {
      player.on('destroy', tryDestroy)

      return () => imported
    }
  }
}

export default plugin
