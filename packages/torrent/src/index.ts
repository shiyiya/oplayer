import {
  loadSDK,
  type Player,
  type PlayerPluginV2,
  type PluginMeta,
  type Source,
  type LoadSourceContext
} from '@oplayer/core'
import type Webtorrent from 'webtorrent'

export type PluginOptions = {
  config?: Record<string, any>
  matcher?: (src: Source) => boolean
  /**
   * https://cdn.jsdelivr.net/npm/webtorrent@0.98.18/webtorrent.min.js
   */
  library?: string
}

class TorrentPlugin implements PlayerPluginV2 {
  readonly meta: PluginMeta = { name: 'torrent' }

  static defaultMatcher: PluginOptions['matcher'] = (source) =>
    /magnet:?[^\"]+/.test(source.src) || /.*\.torrent/.test(source.src)

  static library: Webtorrent.WebTorrent

  private player!: Player

  instance: Webtorrent.Instance

  constructor(public options: PluginOptions) {}

  setup(ctx: Parameters<PlayerPluginV2['setup']>[0]) {
    this.player = ctx.player
    return this
  }

  async loadSource(ctx: LoadSourceContext) {
    const { config = {}, matcher = TorrentPlugin.defaultMatcher, library } = this.options
    const player = this.player

    if (!matcher!(ctx.source)) return false

    if (!TorrentPlugin.library) {
      TorrentPlugin.library =
        (globalThis as any).WebTorrent ||
        (library
          ? await loadSDK(library, 'WebTorrent')
          : (await import('webtorrent/webtorrent.min.js')).default)
    }

    const webtorrent = TorrentPlugin.library

    if (!webtorrent.WEBRTC_SUPPORT) return false

    const instance: Webtorrent.Instance = (this.instance = new webtorrent(config))

    const medias: Webtorrent.TorrentFile[] = []

    instance.add(ctx.source.src, (torrent) => {
      torrent.files.forEach((file) => {
        if (file.name.endsWith('.mp4')) {
          medias.push(file)
        } else if (file.name.startsWith('poster')) {
          file.getBlobURL((err, url) => {
            if (err || !url) return
            ctx.video.poster = url
          })
        }
      })

      if (!medias.length) throw new Error('media not found')

      player.on('loadedmetadata', (e) => {
        if (this.instance) {
          setTimeout(() => {
            player.emit('canplay', e)
          })
        }
      })

      medias[0]!.renderTo(ctx.video, { controls: false })

      const ui = player.pluginManager.getPlugin<any>('ui') as any
      ui?.menu?.register({
        name: 'Torrent',
        position: 'top',
        children: medias.map((media, i) => ({
          name: media.name,
          default: i == 0,
          value: media
        })),
        onChange({ value, name }: any, elm: HTMLElement) {
          elm.innerText = name
          value.renderTo(ctx.video, { controls: false })
        }
      })
    })

    return this
  }

  async unloadSource() {
    if (this.instance) await this.instance.destroy()
  }

  async destroy() {
    await this.unloadSource()
  }
}

export default function create(options: PluginOptions = {}) {
  return new TorrentPlugin(options)
}
