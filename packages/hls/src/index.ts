import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { HlsConfig, LevelSwitchedData } from 'hls.js'

const PLUGIN_NAME = 'oplayer-plugin-hls'

//@ts-ignore
let imported: typeof import('hls.js/dist/hls.min.js') = globalThis.Hls

type PluginOptions = {
  options?: Options
  config?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, source: Source, force?: boolean) => boolean
}

type Options = {
  /**
   * @default: false
   */
  forceHLS?: boolean
  /**
   * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: smooth
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: false
   */
  withBitrate?: boolean
  /**
   * @default false
   */
  showWarning?: boolean
}

const defaultMatcher: PluginOptions['matcher'] = (video, source, force) =>
  (force ||
    !(
      Boolean(video.canPlayType('application/x-mpegURL')) ||
      Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
    )) &&
  (source.format === 'm3u8' ||
    ((source.format === 'auto' || typeof source.format === 'undefined') &&
      /m3u8(#|\?|$)/i.test(source.src)))

const generateSetting = (player: Player, instance: Hls, options: Options = {}) => {
  const settingUpdater = () => {
    const settingOptions = [
      {
        name: player.locales.get('Auto'),
        default: true,
        value: -1
      }
    ]

    if (instance.levels.length > 1)
      instance.levels.forEach((level, i) => {
        let name = (level.name || level.height).toString()
        if (isFinite(+name)) name += 'p'
        if (options.withBitrate) {
          const kb = level.bitrate / 1000
          const useMb = kb > 1000
          const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
          name += ` (${number}${useMb ? 'm' : 'k'}bps)`
        }

        return settingOptions.push({ name, default: false, value: i })
      })

    player.plugins.ui.setting.unregister(PLUGIN_NAME)
    player.plugins.ui.setting.register({
      name: player.locales.get('Quality'),
      type: 'selector',
      key: PLUGIN_NAME,
      icon: player.plugins.ui.icons.quality,
      onChange: (level: typeof settingOptions[number]) => {
        if (options.qualitySwitch == 'immediate') {
          instance.currentLevel = level.value
          if (level.value !== -1) instance.loadLevel = level.value
        } /* if (options.qualitySwitch == 'smooth')*/ else {
          instance.nextLevel = level.value
          if (level.value !== -1) instance.nextLoadLevel = level.value
        }
      },
      children: settingOptions
    })
  }

  // Update settings menu with the information about current level
  const menuUpdater = ({ level }: LevelSwitchedData) => {
    if (!instance.autoLevelEnabled) return

    if (instance.autoLevelEnabled) {
      const height = instance.levels[level]!.height
      const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
      player.plugins.ui.setting.updateLabel(PLUGIN_NAME, levelName)
    } else {
      player.plugins.ui.setting.select(PLUGIN_NAME, level + 1, false)
    }
  }

  instance.once(imported.Events.MANIFEST_PARSED, settingUpdater)
  instance.on(imported.Events.LEVEL_SWITCHED, (_event, data) => menuUpdater(data))
}

const plugin = ({
  config = {},
  options: _pluginOptions,
  matcher = defaultMatcher
}: PluginOptions = {}): PlayerPlugin => {
  let instance: Hls | null

  const pluginOptions: Options = {
    qualityControl: true,
    qualitySwitch: 'smooth',
    ..._pluginOptions
  }

  return {
    name: PLUGIN_NAME,
    key: 'hls',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source, pluginOptions.forceHLS)

      if (instance) {
        player.plugins.ui?.setting.unregister(PLUGIN_NAME)
        instance.destroy()
        instance = null
      }

      if (options.loader || !isMatch) return false

      imported ??= (await import('hls.js/dist/hls.min.js')).default

      if (!imported.isSupported()) return false

      instance = new imported(config)
      instance.loadSource(source.src)
      instance.attachMedia(player.$video)

      if (!player.isNativeUI && pluginOptions.qualityControl && player.plugins.ui?.setting) {
        generateSetting(player, instance, pluginOptions)
      }

      instance.on(imported.Events.ERROR, function (_, data) {
        const { type, details, fatal } = data

        if (fatal) {
          player.hasError = true
          player.emit('error', { ...data, pluginName: PLUGIN_NAME, message: type + ': ' + details })
        } else {
          if (pluginOptions.showWarning) {
            player.emit('notice', { ...data, pluginName: PLUGIN_NAME, text: type + ': ' + details })
          }
        }
      })

      //TODO: remove video onReady Listener
      // onReady is handled by hls.js
      // instance.on(
      //   Hls.Events.MANIFEST_PARSED,
      //   (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => {
      //     emit('canplay', { type: event, payload: data })
      //   }
      // )

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        instance?.destroy()
        instance = null
      })

      return {
        value: () => instance,
        constructor: () => imported
      }
    }
  }
}

export default plugin
