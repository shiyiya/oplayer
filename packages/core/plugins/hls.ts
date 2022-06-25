import { ErrorData, ErrorDetails, HlsConfig } from 'hls.js'
import Hls from 'hls.js/dist/hls.light.min'
import type { PlayerPlugin } from '../src'

let isInitial = false
let hlsInstance: Hls | null = null

const getHls = (options?: Partial<HlsConfig>): Hls => {
  if (hlsInstance) {
    hlsInstance.destroy()
  }
  hlsInstance = new Hls(options)
  return hlsInstance
}

type hlsPluginOptions = {
  hlsConfig?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, src: string) => boolean
}

const defaultMatcher: hlsPluginOptions['matcher'] = (video, src) =>
  /m3u8(#|\?|$)/i.test(src) ||
  Boolean(video.canPlayType('application/x-mpegURL')) ||
  Boolean(video.canPlayType('application/vnd.apple.mpegURL'))

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => ({
  name: 'oplayer-plugin-hls',
  load: ({ on, emit }, video, src: string) => {
    if (!matcher(video, src)) return false

    hlsInstance = getHls({ autoStartLoad: false, ...hlsConfig })
    if (!hlsInstance || !Hls.isSupported()) {
      emit('error', {
        payload: {
          type: 'hlsNotSupported',
          message: 'HLS is not supported'
        }
      })
      return false
    }

    if (!isInitial) {
      emit('plugin:load', { name: 'oplayer-plugin-hls' })
    }

    isInitial = true
    hlsInstance?.attachMedia(video)
    hlsInstance?.loadSource(src)
    hlsInstance?.startLoad()

    Object.values(Hls.Events).forEach((e) => {
      hlsInstance?.on(e as any, (event: string, data: ErrorData) => {
        if (event === Hls.Events.ERROR && data.details == ErrorDetails.MANIFEST_LOAD_ERROR) {
          emit('error', { type: event, payload: data })
        }
        emit(event, data)
      })
    })

    on('destroy', () => {
      hlsInstance?.destroy()
      hlsInstance = null
    })

    return true
  }
})

export default hlsPlugin
