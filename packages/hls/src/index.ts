// import Hls from 'hls.js/dist/hls.light.min.js'
import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { HlsConfig, LevelSwitchedData } from 'hls.js'

//@ts-ignore
import qualitySvg from './quality.svg?raw'

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
    /**
     * @default: false
     */
    withBitrate?: boolean
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
  options: Required<hlsPluginOptions['options']> = {} as any
) => {
  if (!options.hlsQualityControl) return

  const settingUpdater = () => {
    const settingOptions = [
      {
        name: player.locales.get('Auto'),
        type: 'switcher',
        default: true,
        value: -1
      }
    ]

    if (hlsInstance.levels.length > 1)
      hlsInstance.levels.forEach((level, i) => {
        let name = level.name || level.height.toString()
        if (isFinite(+name)) name += 'p'
        if (options.withBitrate) {
          const kb = level.bitrate / 1000
          const useMb = kb > 1000
          const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
          name += ` (${number}${useMb ? 'm' : 'k'}bps)`
        }

        return settingOptions.push({ name, type: 'switcher', default: false, value: i })
      })

    player.emit('removesetting', PLUGIN_NAME)
    player.emit('addsetting', {
      name: player.locales.get('Quality'),
      type: 'selector',
      key: PLUGIN_NAME,
      icon: qualitySvg,
      onChange: (level: typeof settingOptions[number]) => {
        if (options.hlsQualitySwitch == 'immediate') {
          hlsInstance.currentLevel = level.value
        } else if (options.hlsQualitySwitch == 'smooth') {
          hlsInstance.nextLevel = level.value
        }
      },
      children: settingOptions
    })
  }

  // Update settings menu with the information about current level
  const menuUpdater = (data: LevelSwitchedData) => {
    const level = data.level
    if (hlsInstance.autoLevelEnabled) {
      const height = hlsInstance.levels[level]!.height
      const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
      player.emit('updatesettinglabel', { key: PLUGIN_NAME, name: levelName })
    } else {
      player.emit('selectsetting', { key: PLUGIN_NAME, value: level })
    }
  }

  hlsInstance.once(importedHls.Events.MANIFEST_PARSED, settingUpdater)
  hlsInstance.on(importedHls.Events.LEVEL_SWITCHED, (_event, data) => menuUpdater(data))
}

const hlsPlugin = ({
  hlsConfig = {},
  matcher = defaultMatcher,
  options: _pluginOptions
}: hlsPluginOptions = {}): PlayerPlugin => {
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
      generateSetting(player, hlsInstance, pluginOptions)

      //TODO: remove video onReady Listener
      // onReady is handled by hls.js
      // hlsInstance.on(
      //   Hls.Events.MANIFEST_PARSED,
      //   (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => {
      //     emit('canplay', { type: event, payload: data })
      //   }
      // )

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        hlsInstance?.destroy()
        hlsInstance = null as any
      })

      Object.defineProperty(player, 'hls', {
        enumerable: true,
        get: () => ({ value: hlsInstance, constructor: importedHls })
      })
    }
  }
}

export default hlsPlugin
