import Hls from 'hls.js/dist/hls.light.min'
import type { ErrorData, HlsConfig } from 'hls.js'
import type { PlayerPlugin, Source } from '@oplayer/core'

const PLUGIN_NAME = 'oplayer-plugin-hls'

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
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

const defaultMatcher: hlsPluginOptions['matcher'] = (video, source) =>
  !(
    Boolean(video.canPlayType('application/x-mpegURL')) ||
    Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
  ) &&
  (source.format === 'm3u8' || /m3u8(#|\?|$)/i.test(source.src))

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => ({
  name: PLUGIN_NAME,
  load: ({ on, emit }, video, source) => {
    if (!matcher(video, source)) return false

    hlsInstance = getHls({ autoStartLoad: false, ...hlsConfig })
    if (!isInitial) {
      emit('plugin:loaded', { name: PLUGIN_NAME })
      isInitial = true
    }

    if (!hlsInstance || !Hls.isSupported()) {
      emit('error', {
        payload: {
          type: 'hlsNotSupported',
          message: 'hls is not supported'
        }
      })
      return true
    }

    hlsInstance?.attachMedia(video)
    hlsInstance?.loadSource(source.src)
    hlsInstance?.startLoad()

    Object.values(Hls.Events).forEach((e) => {
      hlsInstance?.on(e as any, (event: string, data: ErrorData) => {
        if (
          event === Hls.Events.ERROR &&
          data.details == 'manifestLoadError' /*ErrorDetails.MANIFEST_LOAD_ERROR*/
        ) {
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
