// import Hls from 'hls.js/dist/hls.light.min.js'
import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { ErrorData, HlsConfig } from 'hls.js'

let importedHls: typeof import('hls.js/dist/hls.light.min.js')
const PLUGIN_NAME = 'oplayer-plugin-hls'

type hlsPluginOptions = {
  hlsConfig?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  options?: {
    /**
     * @default: true
     */
    light?: boolean
    /**
     * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
     * default: false
     */
    hlsQualityControl?: boolean
    /**
     *  control how the stream quality is switched. default: smooth
     *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
     *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
     */
    hlsQualitySwitch?: 'immediate' | 'smooth'
  }
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
  HLS: typeof import('hls.js/dist/hls.light.min.js'),
  options: Required<hlsPluginOptions['options']> = {} as any
) => {
  if (!options.hlsQualityControl) return

  hlsInstance.once(HLS.Events.MANIFEST_PARSED, function () {
    hlsInstance.levels.sort((a, b) => b.height - a.height)

    const settingOptions = hlsInstance.levels.map((level, i) => {
      const name = level.name || level.height
      return {
        name: `${name}${isFinite(+name) ? 'p' : ''}` as string,
        type: 'switcher',
        default: hlsInstance.currentLevel == i,
        value: i
      } as const
    })

    settingOptions.unshift({
      name: player.locales.get('Auto'),
      type: 'switcher',
      default:
        hlsInstance.autoLevelEnabled || settingOptions.findIndex((option) => option.default) == -1,
      value: -1
    })

    player.emit('removesetting', PLUGIN_NAME)
    player.emit('addsetting', {
      name: player.locales.get('Quantity'),
      type: 'selector',
      key: PLUGIN_NAME,
      onChange: (level: typeof settingOptions[number], { isInit }: any) => {
        if (!player.isPlaying && isInit) {
          hlsInstance.startLevel = level.value
          return
        }

        if (options.hlsQualitySwitch == 'immediate') {
          hlsInstance.currentLevel = level.value
        } else if (options.hlsQualitySwitch == 'smooth') {
          hlsInstance.nextLevel = level.value
        }
      },
      children: settingOptions.length == 2 ? [settingOptions[0]] : settingOptions
    })
  })
}

const hlsPlugin = (
  {
    hlsConfig = {},
    matcher = defaultMatcher,
    options: _pluginOptions
  }: hlsPluginOptions = {} as hlsPluginOptions
): PlayerPlugin => {
  let hlsInstance: Hls

  const pluginOptions: Required<hlsPluginOptions['options']> = {
    light: true,
    hlsQualityControl: false,
    hlsQualitySwitch: 'smooth',
    ..._pluginOptions
  }
  if (pluginOptions.hlsQualityControl) pluginOptions.light = false

  const getHls = async () => {
    if (hlsInstance) hlsInstance.destroy()

    importedHls ??= (
      await import(pluginOptions.light ? 'hls.js/dist/hls.light.min.js' : 'hls.js/dist/hls.min.js')
    ).default
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
      generateSetting(player, hlsInstance, importedHls, pluginOptions)

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
        hlsInstance?.destroy()
        hlsInstance = null as any
      })
    }
  }
}

export default hlsPlugin
