import webtorrent from 'webtorrent/webtorrent.min.js'
import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Webtorrent from 'webtorrent'

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

  instance: Webtorrent.Instance

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
    const instance: Webtorrent.Instance = (this.instance = new webtorrent(config))
    $video.preload = 'metadata'

    instance.on('error', (err) => {
      this.player.emit('error', {
        message: (<Error>err)?.message || err,
        pluginName: 'oplayer-plugin-torrent'
      })
    })

    //TODO: source list
    instance.add(source.src, (torrent) => {
      const emit = () => {
        this.player.emit('notice', {
          pos: 'right',
          text: `Size:${(torrent.length / 1000000).toFixed(1)}MB Peers:${torrent.numPeers} Progress:${(
            100 * torrent.progress
          ).toFixed(1)}% D:${(instance.downloadSpeed / 1000).toFixed(2)}Kb/s U:${(
            instance.uploadSpeed / 1000
          ).toFixed(2)}Kb/s`
        })
      }

      torrent.on('download', emit)
      torrent.on('upload', emit)

      let foundMp4 = false
      let subtitlePromise: Promise<any>[] = []

      torrent.files.forEach((file) => {
        if (!foundMp4 && file.name.endsWith('.mp4') && file.renderTo) {
          foundMp4 = true
          file.renderTo($video, {
            autoplay: $video.autoplay,
            controls: false,
            maxBlobLength: 2 * 1024 * 1000 * 1000 // 2 GB
          })
        } else if (file.name.endsWith('.srt')) {
          subtitlePromise.push(
            new Promise((resolve) => {
              file.getBlobURL((err, url) => {
                if (err) return
                resolve({
                  name: file.name,
                  src: url
                })
              })
            })
          )
        } else if (file.name.startsWith('poster')) {
          file.getBlobURL((err, url) => {
            if (err || !url) return
            $video.poster = url
          })
        }
      })

      Promise.all(subtitlePromise).then((subtitles) => {
        this.player.context.ui?.subtitle.changeSource(subtitles)
      })
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
