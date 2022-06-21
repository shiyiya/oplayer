import { PlayerPlugin } from '..'
import type { HlsConfig } from 'hls.js'
import Hls from 'hls.js'

let hls: Hls | null = null
let prevSrc: string | null = null

const getHls = (options: Partial<HlsConfig> = {}) => {
  if (!hls) {
    hls = new Hls(options)
  }
  return hls
}

const hlsPlugin: PlayerPlugin = {
  name: 'hlsPlugin',
  load: (src: string, { __video: video, on, emit }) => {
    if (!/m3u8(#|\?|$)/i.test(src)) return false
    if (
      video.canPlayType('application/x-mpegURL') ||
      video.canPlayType('application/vnd.apple.mpegURL')
    ) {
      return false
    }

    hls = getHls()

    if (!hls || !Hls.isSupported()) {
      emit('error', {
        type: 'hlsNotSupported',
        payload: { message: 'HLS is not supported' }
      })
      return false
    }

    if (prevSrc !== src) {
      hls.destroy()
      hls = new Hls({ autoStartLoad: video.autoplay })
    }

    hls.attachMedia(video)
    hls.loadSource(src)
    prevSrc = src

    hls.once(Hls.Events.ERROR, (event, data) => {
      emit('error', {
        type: event,
        payload: data
      })
    })

    on('destroy', () => {
      hls!.destroy()
      hls = null
    })

    return true
  }
}

export default hlsPlugin
