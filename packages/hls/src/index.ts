// import Hls from 'hls.js/dist/hls.light.min.js'
import type Hls from 'hls.js'
import type { ErrorData, HlsConfig } from 'hls.js'
import type { PlayerPlugin, Source } from '@oplayer/core'

let importedHls: any
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
  (source.format === 'm3u8' ||
    ((source.format === 'auto' || typeof source.format === 'undefined') &&
      /m3u8(#|\?|$)/i.test(source.src)))

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => {
  let isInitial = false
  let hlsInstance: Hls

  const getHls = async (options?: Partial<HlsConfig>) => {
    if (hlsInstance) hlsInstance.destroy()
    if (!importedHls) importedHls = await import('hls.js/dist/hls.light.min.js')

    hlsInstance = new importedHls.default(options)
    return { HLS: importedHls.default }
  }

  return {
    name: PLUGIN_NAME,
    load: async ({ on, emit }, video, source) => {
      if (!matcher(video, source)) return false

      const { HLS } = await getHls({ autoStartLoad: false, ...hlsConfig })
      if (!HLS.isSupported()) {
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

      Object.values(HLS.Events).forEach((e) => {
        hlsInstance.on(e as any, (event: string, data: ErrorData) => {
          if (event === HLS.Events.ERROR && data.details == HLS.ErrorDetails.MANIFEST_LOAD_ERROR) {
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
