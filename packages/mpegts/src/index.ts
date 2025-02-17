import { type Player, type PlayerPlugin, type Source, type PartialRequired, loadSDK } from '@oplayer/core'
import type Mpegts from 'mpegts.js'

const PLUGIN_NAME = 'oplayer-plugin-mpegts'

export type Matcher = (video: HTMLVideoElement, source: Source) => boolean

// active inactive
export type Active = (
  instance: Mpegts.Player,
  library: typeof Mpegts
) => void | ((instance: Mpegts.Player, library: typeof Mpegts) => void)

export type MpegtsPluginOptions = {
  config?: Partial<Mpegts.Config>
  matcher?: Matcher
  library?: string
}

const REG = /(flv|ts|m2ts)(#|\?|$)/i

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

  player!: Player

  instance?: Mpegts.Player

  options: PartialRequired<MpegtsPluginOptions, 'matcher'> = {
    matcher: defaultMatcher,
    config: undefined
  }

  constructor(options?: MpegtsPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load({ $video, options }: Player, source: Source) {
    const { matcher, library } = this.options

    if (!matcher($video, source)) return false

    if (!MpegtsPlugin.library) {
      MpegtsPlugin.library =
        (globalThis as any).mpegts ||
        //@ts-expect-error
        (library ? await loadSDK(library, 'mpegts') : (await import('mpegts.js/dist/mpegts.js')).default)

      MpegtsPlugin.library.LoggingControl.applyConfig({
        enableAll: false
      })
    }

    if (!MpegtsPlugin.library.isSupported()) return false

    MpegtsPlugin.library.LoggingControl.addLogListener(this.logListener.bind(this))

    this.instance = MpegtsPlugin.library.createPlayer(
      {
        url: source.src,
        isLive: options.isLive,
        type: source.format || REG.exec(source.src)?.[0]! // could also be mpegts, m2ts, flv
      },
      this.options.config
    )

    this.instance.attachMediaElement($video)
    this.instance.load()

    return this
  }

  destroy() {
    this.instance?.destroy()
    MpegtsPlugin.library.LoggingControl.removeLogListener(this.logListener.bind(this))
  }

  logListener(level: string, msg: string) {
    if (level === 'error') {
      this.player.emit('error', { level, msg, pluginName: PLUGIN_NAME, message: msg })
    }
  }
}

export default function create(options?: MpegtsPluginOptions): PlayerPlugin {
  return new MpegtsPlugin(options)
}
