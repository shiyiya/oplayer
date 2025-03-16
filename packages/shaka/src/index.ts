import { loadSDK, PartialRequired, type Player, type PlayerPlugin, type Source } from '@oplayer/core'
//@ts-ignore
import type Shaka from 'shaka-player'

export type Matcher = (source: Source) => boolean

export interface ShakaPluginOptions {
  library?: string

  matcher?: Matcher
  /**
   *shaka config
   * @type {object}
   */
  config?: any

  qualityControl?: boolean

  requestFilter?: shaka.extern.RequestFilter
}

const defaultMatcher: Matcher = (source) => {
  if (source.format && ['m3u8', 'mdp', 'shaka'].includes(source.format)) {
    return true
  }
  return (
    (source.format === 'auto' || typeof source.format === 'undefined') &&
    /(m3u8|mdp)(#|\?|$)/i.test(source.src)
  )
}

class ShakaPlugin implements PlayerPlugin {
  key = 'shaka'
  name = 'oplayer-plugin-shaka'
  version = __VERSION__

  static library: typeof shaka

  player!: Player

  instance?: shaka.Player

  options: PartialRequired<ShakaPluginOptions, 'matcher'> = {
    matcher: defaultMatcher,
    qualityControl: true
  }

  constructor(options?: ShakaPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load(player: Player, source: Source) {
    if (!this.options.matcher(source)) return false

    const { library, config, qualityControl, requestFilter } = this.options

    if (!ShakaPlugin.library) {
      ShakaPlugin.library =
        (globalThis as any).shaka ||
        (library
          ? await loadSDK(library, 'shaka')
          : (await import('shaka-player/dist/shaka-player.compiled')).default)

      ShakaPlugin.library.polyfill.installAll()
    }

    const ShakaPlayer = ShakaPlugin.library.Player

    if (!ShakaPlayer.isBrowserSupported()) return false

    this.instance = new ShakaPlayer()
    await this.instance.attach(player.$video)

    if (config) {
      if (qualityControl) {
        config.abr = { enabled: true }
      }
      this.instance.configure(config)
    }

    if (requestFilter) {
      this.instance.getNetworkingEngine()?.registerRequestFilter(requestFilter)
    }

    this.instance.addEventListener('error', function (event) {
      player.emit('error', { pluginName: ShakaPlugin.name, ...event })
    })

    if (player.context.ui) {
      //setup ui
    }

    try {
      await this.instance.load(source.src)
    } catch (error: any) {
      player.emit('error', { pluginName: ShakaPlugin.name, ...error })
    }

    return this
  }

  destroy() {
    this.instance?.unload()
    this.instance?.destroy()
  }
}

export default function create(options?: ShakaPluginOptions) {
  return new ShakaPlugin(options)
}
