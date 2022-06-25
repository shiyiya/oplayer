import webtorrent from 'webtorrent/webtorrent.min'
import type { PlayerPlugin } from '../src'

let isInitial = false

type torrentPluginOptions = {
  config?: Record<string, any>
  matcher?: (src: string) => boolean
}

const defaultMatcher: torrentPluginOptions['matcher'] = (src) => /magnet:?[^\"]+/.test(src)

const torrentPlugin = ({
  config = {},
  matcher = defaultMatcher
}: torrentPluginOptions = {}): PlayerPlugin => ({
  name: 'oplayer-plugin-torrent',
  load: ({ on, emit }, video, src: string) => {
    if (!matcher(src)) return false

    if (!webtorrent.WEBRTC_SUPPORT) {
      emit('error', {
        payload: {
          type: 'torrentNotSupported',
          message: 'torrent is not supported'
        }
      })
      return false
    }

    if (!isInitial) {
      emit('plugin:load', { name: 'oplayer-plugin-torrent' })
      isInitial = true
    }

    video.preload = 'metadata'
    const client = new webtorrent(config)
    client.add(src, (torrent: any) => {
      const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'))
      file.renderTo(video, {
        autoplay: video.autoplay,
        controls: false
      })
    })

    on('destroy', () => {
      client.remove(src)
      client.destroy()
    })

    return true
  }
})

export default torrentPlugin
