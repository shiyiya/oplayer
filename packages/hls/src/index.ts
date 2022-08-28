import Hls from 'hls.js/dist/hls.light.min.js'
import type { ErrorData, HlsConfig } from 'hls.js'
import type { PlayerPlugin, Source } from '@oplayer/core'

const PLUGIN_NAME = 'oplayer-plugin-hls'

type hlsPluginOptions = {
  hlsConfig?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

const defaultMatcher: hlsPluginOptions['matcher'] = (video, source) =>
  !(
    Boolean(video.canPlayType('application/x-mpegURL')) ||
    Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
  ) &&
  ((typeof source.format === 'string' && source.format === 'm3u8') ||
    /m3u8(#|\?|$)/i.test(source.src))

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => {
  let isInitial = false
  let hlsInstance: Hls

  const getHls = (options?: Partial<HlsConfig>): Hls => {
    if (hlsInstance) {
      hlsInstance.destroy()
    }
    hlsInstance = new Hls(options)
    return hlsInstance
  }

  return {
    name: PLUGIN_NAME,
    load: ({ on, emit }, video, source) => {
      if (!matcher(video, source)) return false

      hlsInstance = getHls({ autoStartLoad: false, ...hlsConfig })

      if (!Hls.isSupported()) {
        emit('pluginerror', {
          payload: {
            type: 'hlsNotSupported',
            message: 'hlsNotSupported'
          }
        })
        return true
      }

      if (!isInitial) {
        emit('loadedplugin', { name: PLUGIN_NAME })
        isInitial = true
      }

      hlsInstance.attachMedia(video)
      hlsInstance.loadSource(source.src)
      hlsInstance.startLoad()

      //TODO: remove video onReady Listener
      // onReady is handled by hls.js
      // hlsInstance.on(
      //   Hls.Events.MANIFEST_PARSED,
      //   (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => {
      //     emit('canplay', { type: event, payload: data })
      //   }
      // )

      Object.values(Hls.Events).forEach((e) => {
        hlsInstance.on(e as any, (event: string, data: ErrorData) => {
          if (event === Hls.Events.ERROR && data.details == Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            emit('pluginerror', { message: data.type, ...data })
          }
          emit(event, data)
        })
      })

      on('destroy', () => {
        hlsInstance.destroy()
        hlsInstance = null as any
      })

      return true
    },
    apply: () => {
      // restore video onready listener
    }
  }
}

export default hlsPlugin
