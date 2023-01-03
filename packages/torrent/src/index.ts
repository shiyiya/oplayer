import webtorrent from 'webtorrent/webtorrent.min.js'
import type { PlayerPlugin, Source } from '@oplayer/core'

let client: any
const PLUGIN_NAME = 'oplayer-plugin-torrent'

type torrentPluginOptions = {
  config?: Record<string, any>
  matcher?: (src: Source) => boolean
}

const defaultMatcher: torrentPluginOptions['matcher'] = (source) =>
  /magnet:?[^\"]+/.test(source.src) || /.*\.torrent/.test(source.src)

const torrentPlugin = ({
  config = {},
  matcher = defaultMatcher
}: torrentPluginOptions = {}): PlayerPlugin => {
  let prePreload: HTMLMediaElement['preload']
  let instanceDestroy: (() => void) | null

  function tryDestroy() {
    if (client) {
      instanceDestroy?.call(client)
      instanceDestroy = null
      client = null
    }
  }

  return {
    name: PLUGIN_NAME,
    load: (player, source) => {
      if (!matcher(source)) return false

      if (!webtorrent.WEBRTC_SUPPORT) return false

      const { $video } = player
      prePreload = $video.preload
      client = new webtorrent(config)

      $video.preload = 'metadata'
      client.add(source.src, (torrent: any) => {
        const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'))
        file.renderTo($video, { autoplay: $video.autoplay, controls: false })
      })

      instanceDestroy = () => {
        client.remove(source.src)
        client.destroy()
        $video.preload = prePreload
      }
      client.destroy = () => {
        tryDestroy()
      }

      return client
    },
    apply: ({ on }) => {
      on('destroy', () => {
        tryDestroy()
      })

      return webtorrent
    }
  }
}
export default torrentPlugin
