import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { HlsConfig, LevelSwitchedData } from 'hls.js'

const PLUGIN_NAME = 'oplayer-plugin-hls'

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

interface SettingItem {
  name: string
  default: boolean
  value: any
}

const defaultMatcher: PluginOptions['matcher'] = (video, source) =>
  !(
    Boolean(video.canPlayType('application/x-mpegURL')) ||
    Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
  ) &&
  (source.format === 'hls' ||
    source.format === 'm3u8' ||
    ((source.format === 'auto' || typeof source.format === 'undefined') &&
      /m3u8(#|\?|$)/i.test(source.src)))

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
              (pre, level, i) => {
                let name = (level.name || level.height).toString()
                if (isFinite(+name)) name += 'p'
                if (options.withBitrate) {
                  const kb = level.bitrate / 1000
                  const useMb = kb > 1000
                  const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
                  name += ` (${number}${useMb ? 'm' : 'k'}bps)`
                }
                pre.push({ name, default: instance.currentLevel == i, value: i })
                return pre
              },
              [
                {
                  name: player.locales.get('Auto'),
                  default: instance.autoLevelEnabled,
                  value: -1
                }
              ] as SettingItem[]
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
      settingUpdater({
        icon: player.plugins.ui.icons.lang,
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
      settingUpdater({
        icon: player.plugins.ui.icons.subtitle,
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
                  name: player.locales.get('Off'),
                  default: !instance.subtitleDisplay,
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
    settings: () => SettingItem[]
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

  function tryDestroy(player: Player) {
    if (instance) {
      removeSetting(player)
      instance.destroy()
      instance = null
    }
  }

  return {
    name: PLUGIN_NAME,
    key: 'hls',
    load: async (player, source, options) => {
      tryDestroy(player)

      if (options.loader || !matcher(player.$video, source)) return false

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

      return instance
    },
    apply: (player) => {
      player.on('destroy', () => {
        tryDestroy(player)
      })

      return () => imported
    }
  }
}

export default plugin
