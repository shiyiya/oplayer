import type { ErrorData, Events, HlsConfig } from 'hls.js'
import Hls from 'hls.js/dist/hls.light.min'
import type { PlayerPlugin } from '../src'

let hlsTnstance: Hls | null = null
let prevSrc: string | null = null

const getHls = (options?: Partial<HlsConfig>): Hls => {
  if (!hlsTnstance) {
    hlsTnstance = new Hls(options)
  }
  return hlsTnstance!
}

const hlsPlugin: PlayerPlugin = {
  name: 'oplayer-plugin-hls',
  load: ({ on, emit }, video, src: string) => {
    if (!/m3u8(#|\?|$)/i.test(src)) return false
    if (
      video.canPlayType('application/x-mpegURL') ||
      video.canPlayType('application/vnd.apple.mpegURL')
    ) {
      return false
    }

    hlsTnstance = getHls({ autoStartLoad: video.autoplay })
    if (!hlsTnstance || !Hls.isSupported()) {
      emit('error', {
        type: 'hlsNotSupported',
        payload: { message: 'HLS is not supported' }
      })
      return false
    }

    if (prevSrc && prevSrc !== src) {
      hlsTnstance.destroy()
      hlsTnstance.detachMedia()
      hlsTnstance = new Hls({ autoStartLoad: video.autoplay })
    }

    hlsTnstance!.attachMedia(video)
    hlsTnstance!.loadSource(src)
    prevSrc = src

    hlsTnstance!.once(Hls.Events.ERROR, (event: Events.ERROR, data: ErrorData) => {
      emit('error', {
        type: event,
        payload: data
      })
    })

    on('destroy', () => {
      hlsTnstance?.destroy()
      hlsTnstance = null
    })

    return true
  }
}

export default hlsPlugin
