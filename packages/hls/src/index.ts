// import Hls from 'hls.js/dist/hls.light.min.js'
import type Hls from 'hls.js'
import type { ErrorData, HlsConfig } from 'hls.js'
import type { PlayerPlugin, Source, Player } from '@oplayer/core'

let importedHls: typeof import('hls.js/dist/hls.light.min.js')
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
        name: `${level.name || level.height}p` as string,
        type: 'switcher',
        default: hlsInstance.currentLevel == i,
        value: i
      } as const
    })

    options.unshift({
      name: player.locales.get('Auto'),
      type: 'switcher',
      default: hlsInstance.autoLevelEnabled || options.findIndex((option) => option.default) == -1,
      value: -1
    })

    player.emit('removesetting', PLUGIN_NAME)
    player.emit('addsetting', {
      name: player.locales.get('Quantity'),
      type: 'selector',
      key: PLUGIN_NAME,
      onChange: (level: typeof options[number]) => {
        hlsInstance.currentLevel = level.value
      },
      children: options.length == 2 ? [options[0]] : options
    })
  })
}

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher
}: hlsPluginOptions = {}): PlayerPlugin => {
  let hlsInstance: Hls

  const getHls = async () => {
    if (hlsInstance) hlsInstance.destroy()

    importedHls ??= (await import('hls.js/dist/hls.light.min.js')).default
    hlsInstance = new importedHls(hlsConfig)
  }

  return {
    name: PLUGIN_NAME,
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (options.loader || !isMatch) {
        hlsInstance?.destroy()
        player.emit('removesetting', PLUGIN_NAME)

        return false
      }

      await getHls()

      if (!importedHls.isSupported()) return false

      hlsInstance.loadSource(source.src)
      hlsInstance.attachMedia(player.$video)
      hlsInstance.startLoad()
      generateSetting(player, hlsInstance, importedHls)

      //TODO: remove video onReady Listener
      // onReady is handled by hls.js
      // hlsInstance.on(
      //   Hls.Events.MANIFEST_PARSED,
      //   (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => {
      //     emit('canplay', { type: event, payload: data })
      //   }
      // )

      Object.values(importedHls.Events).forEach((e) => {
        hlsInstance.on(e as any, (event: string, data: ErrorData) => {
          if (
            event === importedHls.Events.ERROR &&
            data.details == importedHls.ErrorDetails.MANIFEST_LOAD_ERROR
          ) {
            player.emit('pluginerror', { message: data.type, ...data })
          }
          player.emit(event, data)
        })
      })

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        hlsInstance.destroy()
        hlsInstance = null as any
      })
    }
  }
}

export default hlsPlugin
