import webtorrent from 'webtorrent/dist/webtorrent.min.js'
import type { Player, PlayerPlugin, Source } from '@oplayer/core'

export type PluginOptions = {
  config?: Record<string, any>
  matcher?: (src: Source) => boolean
}

class TorrentPlugin implements PlayerPlugin {
  key = 'torrent'
  name = 'oplayer-plugin-torrent'
  //@ts-ignore
  version = __VERSION__

  static defaultMatcher: PluginOptions['matcher'] = (source) =>
    /magnet:?[^\"]+/.test(source.src) || /.*\.torrent/.test(source.src)

  player!: Player

  instance: any

  prePreload?: HTMLMediaElement['preload']

  constructor(public options: PluginOptions) {}

  apply(player: Player) {
    this.player = player
    return this
  }

  async load({ $video }: Player, source: Source) {
    const { config = {}, matcher = TorrentPlugin.defaultMatcher } = this.options

    if (!matcher!(source)) return false

    if (!webtorrent.WEBRTC_SUPPORT) return false

    this.prePreload ??= $video.preload
    this.instance = new webtorrent(config)
    $video.preload = 'metadata'

    //TODO: source list
    this.instance.add(source.src, (torrent: any) => {
      const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'))
      file.renderTo($video, { autoplay: $video.autoplay, controls: false })
    })

    return this
  }

  async unload() {
    if (this.instance) await this.instance.destroy()
    if (this.prePreload) this.player.$video.preload = this.prePreload
    this.prePreload = undefined
  }

  async destroy() {
    await this.unload()
  }
}

export default function create(options: PluginOptions = {}) {
  return new TorrentPlugin(options)
}
