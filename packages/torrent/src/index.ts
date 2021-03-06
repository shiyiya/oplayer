import webtorrent from 'webtorrent/webtorrent.min.js'
import type { PlayerPlugin, Source } from '@oplayer/core'

const PLUGIN_NAME = 'oplayer-plugin-torrent'

let isInitial = false
let prevSrc = ''

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
  name: PLUGIN_NAME,
  load: ({ on, emit }, video, source) => {
    if (!matcher(source)) return false

    if (!isInitial) {
      emit('plugin:loaded', { name: PLUGIN_NAME })
      isInitial = true
    }

    if (!webtorrent.WEBRTC_SUPPORT) {
      emit('plugin:error', {
        payload: {
          type: 'torrentNotSupported',
          message: 'torrent is not supported'
        }
      })
      return true
    }

    prevSrc = source.src
    video.preload = 'metadata'
    const client = new webtorrent(config)
    client.add(source.src, (torrent: any) => {
      const file = torrent.files.find((file: any) => file.name.endsWith('.mp4'))
      file.renderTo(video, {
        autoplay: video.autoplay,
        controls: false
      })
    })

    on('videosourcechange', () => {
      client.remove(prevSrc)
    })

    on('destroy', () => {
      client.remove(source.src)
      client.destroy()
    })

    return true
  }
})

export default torrentPlugin
