/// <reference path="../../../types.d.ts" />
import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Mpegts from 'mpegts.js'

const PLUGIN_NAME = 'oplayer-plugin-mpegts'

type PluginOptions = {
  config?: Partial<Mpegts.Config>
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

const REG = /flv|ts|m2ts(#|\?|$)/i

const defaultMatcher: PluginOptions['matcher'] = (_, source) => {
  if (source.format && ['flv', 'm2ts', 'mpegts'].includes(source.format)) {
    return true
  }

  return (source.format === 'auto' || typeof source.format === 'undefined') && REG.test(source.src)
}

class MpegtsPlugin implements PlayerPlugin {
  key = 'mpegts'
  name = PLUGIN_NAME
  version = __VERSION__

  static defaultMatcher: PluginOptions['matcher'] = defaultMatcher

  //@ts-ignore
  static library: typeof Mpegts = globalThis.mpegts

  player: Player

  instance: Mpegts.Player

  constructor(public options: PluginOptions) {}

  apply(player: Player) {
    this.player = player
  }

  async load({ $video, options }: Player, source: Source) {
    const { matcher = MpegtsPlugin.defaultMatcher } = this.options

    if (!matcher!($video, source)) return false

    const { config } = this.options

    //@ts-ignore
    MpegtsPlugin.library ??= (await import('mpegts.js/dist/mpegts.js')).default

    if (!MpegtsPlugin.library.isSupported()) return false

    this.instance = MpegtsPlugin.library.createPlayer(
      {
        url: source.src,
        isLive: options.isLive,
        type: source.format || REG.exec(source.src)?.[0]! // could also be mpegts, m2ts, flv
      },
      config
    )

    const { player, instance } = this
    instance.attachMediaElement(player.$video)
    instance.load()

    instance.on(MpegtsPlugin.library.Events.ERROR, function (_, data) {
      const { type, details, fatal } = data

      if (fatal) {
        player.hasError = true
        player.emit('error', { ...data, pluginName: PLUGIN_NAME, message: type + ': ' + details })
      }
    })

    return this
  }

  async unload() {
    this.instance.destroy()
  }

  async destroy() {
    await this.unload()
  }
}

export default function create(options: PluginOptions = {}): PlayerPlugin {
  return new MpegtsPlugin(options)
}
