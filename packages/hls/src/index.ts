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
  (source.format === 'm3u8' || /m3u8(#|\?|$)/i.test(source.src))

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => {
  let isInitial = false
  let hlsInstance: Hls | null = null

  const getHls = (options?: Partial<HlsConfig>): Hls => {
    if (hlsInstance) {
      hlsInstance.destroy()
    }
    hlsInstance = new Hls(options)
    return hlsInstance
  }

  return {
    name: PLUGIN_NAME,
    load: ({ on, emit, offAny }, video, source) => {
      if (!matcher(video, source)) return false

      hlsInstance = getHls({ autoStartLoad: false, ...hlsConfig })

      if (!hlsInstance || !Hls.isSupported()) {
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
        offAny('canplay') //onReady is handled by hls.js
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
            emit('pluginerror', { message: data.type, ...data })
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
  }
}

export default hlsPlugin
