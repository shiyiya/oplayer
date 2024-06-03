import { loadSDK, type Player, type PlayerPlugin, type Source } from '@oplayer/core'
import type Webtorrent from 'webtorrent'

export type PluginOptions = {
  config?: Record<string, any>
  matcher?: (src: Source) => boolean
  /**
   * https://cdn.jsdelivr.net/npm/webtorrent@0.98.18/webtorrent.min.js
   */
  library?: string
}

class TorrentPlugin implements PlayerPlugin {
  key = 'torrent'
  name = 'oplayer-plugin-torrent'
  //@ts-ignore
  version = __VERSION__

  static defaultMatcher: PluginOptions['matcher'] = (source) =>
    /magnet:?[^\"]+/.test(source.src) || /.*\.torrent/.test(source.src)

  static library: Webtorrent.WebTorrent

  player!: Player

  instance: Webtorrent.Instance

  constructor(public options: PluginOptions) {}

  apply(player: Player) {
    this.player = player
    return this
  }

  async load({ $video }: Player, source: Source) {
    const { config = {}, matcher = TorrentPlugin.defaultMatcher, library } = this.options

    if (!matcher!(source)) return false

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

    instance.add(source.src, (torrent) => {
      torrent.files.forEach((file) => {
        if (file.name.endsWith('.mp4')) {
          medias.push(file)
        }
        // else if (file.name.endsWith('.srt')) {
        // subtitlePromise.push(
        //   new Promise((resolve) => {
        //     file.getBlobURL((err, url) => {
        //       if (err) return
        //       resolve({
        //         name: file.name,
        //         src: url
        //       })
        //     })
        //   })
        // )
        // }
        else if (file.name.startsWith('poster')) {
          file.getBlobURL((err, url) => {
            if (err || !url) return
            $video.poster = url
          })
        }
      })

      if (!medias.length) throw new Error('media not found')

      this.player.on('loadedmetadata', (e) => {
        if (this.instance) {
          setTimeout(() => {
            this.player.emit('canplay', e)
          })
        }
      })

      medias[0]!.renderTo($video, { controls: false })

      this.player.context.ui?.menu.register({
        name: 'Torrent',
        position: 'top',
        children: medias.map((media, i) => ({
          name: media.name,
          default: i == 0,
          value: media
        })),
        onChange({ value, name }: any, elm: HTMLElement) {
          elm.innerText = name
          value.renderTo($video, { controls: false })
        }
      })
    })

    return this
  }

  async unload() {
    if (this.instance) await this.instance.destroy()
  }

  async destroy() {
    await this.unload()
  }
}

export default function create(options: PluginOptions = {}) {
  return new TorrentPlugin(options)
}
