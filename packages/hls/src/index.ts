// import Hls from 'hls.js/dist/hls.light.min.js'
import type Hls from 'hls.js'
import type { ErrorData, HlsConfig } from 'hls.js'
import type { PlayerPlugin, Source, PlayerEvent, Player } from '@oplayer/core'

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

const generateSetting = (
  player: Player,
  hlsInstance: Hls,
  HLS: typeof import('hls.js/dist/hls.light.min.js')
) => {
  hlsInstance.once(HLS.Events.MANIFEST_PARSED, function () {
    hlsInstance.levels.sort((a, b) => b.height - a.height)

    const options = hlsInstance.levels.map((level, i) => {
      return {
        name: `${level.name || level.height}P` as string,
        type: 'switcher',
        default: hlsInstance.currentLevel == i,
        value: i
      } as const
    })

    if (options.findIndex((setting) => setting.default) == -1) {
      options.unshift({
        name: player.locales.get('Auto'),
        type: 'switcher',
        default: true,
        value: -1
      })
    }

    player.emit('removesetting', PLUGIN_NAME)
    player.emit('addsetting', {
      name: player.locales.get('Quantity'),
      type: 'selector',
      key: PLUGIN_NAME,
      onChange: (level: typeof options[number]) => {
        hlsInstance.currentLevel = level.value
      },
      children: options
    })
  })
}

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => {
  let isInitial = false
  let hlsInstance: Hls
  let isActive = false
  let HLS: typeof import('hls.js/dist/hls.light.min.js')

  const getHls = async (options?: Partial<HlsConfig>) => {
    if (hlsInstance) hlsInstance.destroy()
    if (!importedHls) importedHls = await import('hls.js/dist/hls.light.min.js')

    hlsInstance = new importedHls.default(options)
    HLS = importedHls.default
  }

  return {
    name: PLUGIN_NAME,
    load: async (player, video, source) => {
      if (!matcher(video, source)) return false
      const { on, emit } = player

      await getHls({ autoStartLoad: false, ...hlsConfig })
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
        isInitial = true
        isActive = true
        emit('loadedplugin', { name: PLUGIN_NAME })
        generateSetting(player, hlsInstance, HLS)
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
    apply: (player: Player) => {
      player.on('videosourcechange', ({ payload }: PlayerEvent) => {
        if (isInitial) {
          if (matcher(player.$video, payload)) {
            isActive = true
            generateSetting(player, hlsInstance, HLS)
          } else {
            if (isActive) {
              hlsInstance.destroy()
              player.emit('removesetting', PLUGIN_NAME)
            }
            isActive = false
          }
        }
      })
    }
  }
}

export default hlsPlugin
