import {
  type Player,
  type PlayerPluginV2,
  type Source,
  type PartialRequired,
  type PluginMeta,
  type LoadSourceContext,
  loadSDK
} from '@oplayer/core'
import type Mpegts from 'mpegts.js'

const PLUGIN_NAME = 'mpegts'

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

class MpegtsPlugin implements PlayerPluginV2 {
  readonly meta: PluginMeta = { name: PLUGIN_NAME }

  static library: typeof Mpegts = (globalThis as any).mpegts

  private player!: Player

  instance?: Mpegts.Player

  // Bound reference for proper cleanup in destroy()
  private _boundLogListener!: (level: string, msg: string) => void

  options: PartialRequired<MpegtsPluginOptions, 'matcher'> = {
    matcher: defaultMatcher,
    config: undefined
  }

  constructor(options?: MpegtsPluginOptions) {
    Object.assign(this.options, options)
  }

  setup(ctx: Parameters<PlayerPluginV2['setup']>[0]) {
    this.player = ctx.player
    return this
  }

  async loadSource(ctx: LoadSourceContext) {
    const { matcher, library } = this.options

    if (!matcher(ctx.video, ctx.source)) return false

    if (!MpegtsPlugin.library) {
      MpegtsPlugin.library =
        (globalThis as Record<string, unknown>).mpegts ||
        //@ts-expect-error
        (library ? await loadSDK(library, 'mpegts') : (await import('mpegts.js/dist/mpegts.js')).default)

      MpegtsPlugin.library.LoggingControl.applyConfig({
        enableAll: false
      })
    }

    if (!MpegtsPlugin.library.isSupported()) return false

    this._boundLogListener = this.logListener.bind(this)
    MpegtsPlugin.library.LoggingControl.addLogListener(this._boundLogListener)

    this.instance = MpegtsPlugin.library.createPlayer(
      {
        url: ctx.source.src,
        isLive: ctx.options.isLive,
        type: ctx.source.format || REG.exec(ctx.source.src)?.[0]! // could also be mpegts, m2ts, flv
      },
      this.options.config
    )

    this.instance.attachMediaElement(ctx.video)
    this.instance.load()

    return this
  }

  destroy() {
    this.instance?.destroy()
    if (this._boundLogListener) {
      MpegtsPlugin.library.LoggingControl.removeLogListener(this._boundLogListener)
    }
  }

  logListener(level: string, msg: string) {
    if (level === 'error') {
      this.player.emit('error', { level, msg, pluginName: PLUGIN_NAME, message: msg })
    }
  }
}

export default function create(options?: MpegtsPluginOptions): PlayerPluginV2 {
  return new MpegtsPlugin(options)
}
