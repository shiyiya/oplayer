import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { HlsConfig, LevelSwitchedData } from 'hls.js'

const PLUGIN_NAME = 'oplayer-plugin-hls'

const languageIcon = `<svg viewBox="0 0 1024 1024"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333z m294.4 256H682.666667c-12.8-55.466667-34.133333-102.4-59.733334-153.6 76.8 29.866667 145.066667 81.066667 183.466667 153.6zM512 170.666667c34.133333 51.2 64 106.666667 81.066667 170.666666h-162.133334c17.066667-59.733333 46.933333-119.466667 81.066667-170.666666zM183.466667 597.333333c-8.533333-25.6-12.8-55.466667-12.8-85.333333s4.266667-59.733333 12.8-85.333333h145.066666c-4.266667 29.866667-4.266667 55.466667-4.266666 85.333333s4.266667 55.466667 4.266666 85.333333H183.466667z m34.133333 85.333334H341.333333c12.8 55.466667 34.133333 102.4 59.733334 153.6-76.8-29.866667-145.066667-81.066667-183.466667-153.6zM341.333333 341.333333H217.6c42.666667-72.533333 106.666667-123.733333 183.466667-153.6C375.466667 238.933333 354.133333 285.866667 341.333333 341.333333z m170.666667 512c-34.133333-51.2-64-106.666667-81.066667-170.666666h162.133334c-17.066667 59.733333-46.933333 119.466667-81.066667 170.666666z m98.133333-256H413.866667c-4.266667-29.866667-8.533333-55.466667-8.533334-85.333333s4.266667-55.466667 8.533334-85.333333h200.533333c4.266667 29.866667 8.533333 55.466667 8.533333 85.333333s-8.533333 55.466667-12.8 85.333333z m12.8 238.933334c25.6-46.933333 46.933333-98.133333 59.733334-153.6h123.733333c-38.4 72.533333-106.666667 123.733333-183.466667 153.6z m76.8-238.933334c4.266667-29.866667 4.266667-55.466667 4.266667-85.333333s-4.266667-55.466667-4.266667-85.333333h145.066667c8.533333 25.6 12.8 55.466667 12.8 85.333333s-4.266667 59.733333-12.8 85.333333h-145.066667z"></path></svg>`

//@ts-ignore
let imported: typeof import('hls.js/dist/hls.min.js') = globalThis.Hls

type PluginOptions = {
  config?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, source: Source, force?: boolean) => boolean
} & Options

type Options = {
  /**
   * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: immediate
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: false
   */
  withBitrate?: boolean
  audioControl?: boolean
  textControl?: boolean
  /**
   * @default false
   */
  showWarning?: boolean
}

const defaultMatcher: PluginOptions['matcher'] = (video, source) =>
  !(
    Boolean(video.canPlayType('application/x-mpegURL')) ||
    Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
  ) &&
  (source.format === 'm3u8' ||
    ((source.format === 'auto' || typeof source.format === 'undefined') &&
      /m3u8(#|\?|$)/i.test(source.src)))

interface settingItem {
  name: string
  default: boolean
  value: any
}

const generateSetting = (player: Player, instance: Hls, options: Options = {}) => {
  if (options.qualityControl) {
    instance.on(imported.Events.LEVEL_SWITCHED, (_event, data) => menuUpdater(data))
    instance.once(imported.Events.MANIFEST_PARSED, () => {
      settingUpdater({
        icon: player.plugins.ui.icons.quality,
        name: player.locales.get('Quality'),
        settings() {
          if (instance.levels.length > 1) {
            return instance.levels.reduce(
              (pre, level) => {
                let name = (level.name || level.height).toString()
                if (isFinite(+name)) name += 'p'
                if (options.withBitrate) {
                  const kb = level.bitrate / 1000
                  const useMb = kb > 1000
                  const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
                  name += ` (${number}${useMb ? 'm' : 'k'}bps)`
                }
                pre.push({ name, default: instance.currentLevel == level.id, value: level.id })
                return pre
              },
              [
                {
                  name: `${player.locales.get('Auto')}`,
                  default: true,
                  value: (instance.currentLevel == -1) as any
                }
              ] as settingItem[]
            )
          }

          return []
        },
        onChange(it) {
          if (options.qualitySwitch == 'immediate') {
            instance.currentLevel = it.value
            if (it.value !== -1) instance.loadLevel = it.value
          } else {
            instance.nextLevel = it.value
            if (it.value !== -1) instance.nextLoadLevel = it.value
          }
        }
      })
    })
  }

  if (options.audioControl)
    instance.on(imported.Events.AUDIO_TRACK_LOADED, () => {
      console.log(instance.audioTracks)

      settingUpdater({
        icon: languageIcon,
        name: player.locales.get('Language'),
        settings() {
          if (instance.audioTracks.length > 1) {
            return instance.audioTracks.map(({ name, lang, id }) => ({
              name: lang || name,
              default: instance.audioTrack == id,
              value: id
            }))
          }
          return []
        },
        onChange(it) {
          instance.audioTrack = it.value
        }
      })
    })

  if (options.textControl)
    instance.on(imported.Events.SUBTITLE_TRACK_LOADED, () => {
      console.log(instance.subtitleTracks)
      settingUpdater({
        icon: player.plugin.ui.subtitle,
        name: player.locales.get('Subtitle'),
        settings() {
          if (instance.subtitleTracks.length > 1) {
            return instance.subtitleTracks.reduce(
              (pre, { name, lang, id }) => {
                return (
                  pre.push({
                    name: lang || name,
                    default: instance.subtitleTrack == id,
                    value: id
                  }),
                  pre
                )
              },
              [
                {
                  name: player.locales.get('Close'),
                  default: instance.subtitleDisplay,
                  value: -1
                }
              ]
            )
          }
          return []
        },
        onChange({ value }) {
          if ((instance.subtitleDisplay = !(value == -1))) {
            instance.subtitleTrack = value
          }
        }
      })
    })

  function settingUpdater(arg: {
    icon: string
    name: string
    settings: () => settingItem[]
    onChange: (it: { value: any }) => void
  }) {
    const settings = arg.settings()
    if (settings.length < 2) return

    const { name, icon, onChange } = arg

    player.plugins.ui.setting.unregister(`${PLUGIN_NAME}-${name}`)
    player.plugins.ui.setting.register({
      name,
      icon,
      onChange,
      type: 'selector',
      key: `${PLUGIN_NAME}-${name}`,
      children: settings
    })
  }

  // Update settings menu with the information about current level
  function menuUpdater({ level }: LevelSwitchedData) {
    if (!instance.autoLevelEnabled) return

    if (instance.autoLevelEnabled) {
      const height = instance.levels[level]!.height
      const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
      player.plugins.ui.setting.updateLabel(PLUGIN_NAME, levelName)
    } else {
      player.plugins.ui.setting.select(PLUGIN_NAME, level + 1, false)
    }
  }
}

const removeSetting = (player: Player) => {
  ;[
    player.locales.get('Quality'),
    player.locales.get('Language'),
    player.locales.get('Subtitle')
  ].forEach((it) => player.plugins.ui?.setting.unregister(`${PLUGIN_NAME}-${it}`))
}

const plugin = ({
  config,
  showWarning = false,
  withBitrate = false,
  qualityControl = true,
  qualitySwitch = 'immediate',
  audioControl = true,
  textControl = true,
  matcher = defaultMatcher
}: PluginOptions = {}): PlayerPlugin => {
  let instance: Hls | null

  return {
    name: PLUGIN_NAME,
    key: 'hls',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (instance) {
        removeSetting(player)
        instance.destroy()
        instance = null
      }

      if (options.loader || !isMatch) return false

      imported ??= (await import('hls.js/dist/hls.min.js')).default

      if (!imported.isSupported()) return false

      instance = new imported(config)
      instance.loadSource(source.src)
      instance.attachMedia(player.$video)

      if (!player.isNativeUI && player.plugins.ui?.setting) {
        generateSetting(player, instance, {
          qualityControl,
          qualitySwitch,
          withBitrate,
          audioControl,
          textControl
        })
      }

      instance.on(imported.Events.ERROR, function (_, data) {
        const { type, details, fatal } = data

        if (fatal) {
          player.hasError = true
          player.emit('error', { ...data, pluginName: PLUGIN_NAME, message: type + ': ' + details })
        } else {
          if (showWarning) {
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
