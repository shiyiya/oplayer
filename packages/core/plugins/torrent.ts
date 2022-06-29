import webtorrent from 'webtorrent/webtorrent.min'
import type { PlayerPlugin, Source } from '../src'

let isInitial = false

type torrentPluginOptions = {
  config?: Record<string, any>
  matcher?: (src: Source) => boolean
}

const defaultMatcher: torrentPluginOptions['matcher'] = (source) =>
  /magnet:?[^\"]+/.test(source.src) || /.*\.torrent/.test(source.src)

const torrentPlugin = ({
  config = {},
  matcher = defaultMatcher
}: torrentPluginOptions = {}): PlayerPlugin => ({
  name: 'oplayer-plugin-torrent',
  load: ({ on, emit }, video, source) => {
    if (!matcher(source)) return false

    if (!webtorrent.WEBRTC_SUPPORT) {
      emit('error', {
        payload: {
          type: 'torrentNotSupported',
          message: 'torrent is not supported'
        }
      })
      return true
    }

    if (!isInitial) {
      emit('plugin:loaded', { name: 'oplayer-plugin-torrent' })
      isInitial = true
    }

    video.preload = 'metadata'
    const client = new webtorrent(config)
    client.add(source.src, (torrent: any) => {
      const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'))
      file.renderTo(video, {
        autoplay: video.autoplay,
        controls: false
      })
    })

    on('destroy', () => {
      client.remove(source.src)
      client.destroy()
    })

    return true
  }
})

export default torrentPlugin
