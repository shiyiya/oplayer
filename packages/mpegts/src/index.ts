import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Mpegts from 'mpegts.js'

const PLUGIN_NAME = 'oplayer-plugin-mpegts'

export type Matcher = (video: HTMLVideoElement, source: Source) => boolean

export type MpegtsPluginOptions = {
  config?: Partial<Mpegts.Config>
  matcher?: Matcher
}

const REG = /flv|ts|m2ts(#|\?|$)/i

const defaultMatcher: Matcher = (_, source) => {
  if (source.format && ['flv', 'm2ts', 'mpegts'].includes(source.format)) {
    return true
  }

  return (source.format === 'auto' || typeof source.format === 'undefined') && REG.test(source.src)
}

class MpegtsPlugin implements PlayerPlugin {
  key = 'mpegts'
  name = PLUGIN_NAME
  version = __VERSION__

  static library: typeof Mpegts = (globalThis as any).mpegts

  player: Player

  instance?: Mpegts.Player

  options: Required<MpegtsPluginOptions> = {
    config: undefined as any,
    matcher: defaultMatcher
  }

  constructor(options?: MpegtsPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
  }

  async load({ $video, options }: Player, source: Source) {
    const { matcher } = this.options

    if (!matcher($video, source)) return false

    //@ts-ignore
    MpegtsPlugin.library ??= (await import('mpegts.js/dist/mpegts.js')).default

    if (!MpegtsPlugin.library.isSupported()) return false

    this.instance = MpegtsPlugin.library.createPlayer(
      {
        url: source.src,
        isLive: options.isLive,
        type: source.format || REG.exec(source.src)?.[0]! // could also be mpegts, m2ts, flv
      },
      this.options.config
    )

    const { player, instance } = this
    instance.attachMediaElement($video)
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

  destroy() {
    this.instance?.destroy()
  }
}

export default function create(options?: MpegtsPluginOptions): PlayerPlugin {
  return new MpegtsPlugin(options)
}
