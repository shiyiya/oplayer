import { loadSDK, type Player, type PlayerPlugin, type RequiredPartial, type Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { ErrorData, HlsConfig, LevelSwitchedData } from 'hls.js'

const PLUGIN_NAME = 'oplayer-plugin-hls'

export type Matcher = (video: HTMLVideoElement, source: Source, forceHLS: boolean) => boolean

export interface HlsPluginOptions {
  library?: string

  matcher?: Matcher

  /**
   * custom handle hls fatal error
   */
  errorHandler?: (player: Player, data: ErrorData) => void
  /**
   * config for hls.js
   *
   * @type {Partial<HlsConfig>}
   */
  config?: Partial<HlsConfig>
  /**
   * force use hls.js
   * @type {boolean} false
   */
  forceHLS?: boolean
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
  /**
   * @default: true
   */
  audioControl?: boolean
  /**
   * @default: true
   */
  textControl?: boolean
}

const defaultMatcher: Matcher = (video, source, forceHLS) => {
  return (
    source.format === 'hls' ||
    source.format === 'm3u8' ||
    ((source.format === 'auto' || typeof source.format === 'undefined') &&
      /m3u8(#|\?|$)/i.test(source.src) &&
      (forceHLS ||
        !(
          Boolean(video.canPlayType('application/x-mpegURL')) ||
          Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
        )))
  )
}

class HlsPlugin implements PlayerPlugin {
  key = 'hls'
  name = PLUGIN_NAME
  version = __VERSION__

  static library: typeof import('hls.js/dist/hls.min.js')

  player!: Player

  instance?: Hls

  options: RequiredPartial<HlsPluginOptions, 'library' | 'errorHandler'> = {
    config: {},
    forceHLS: false,
    textControl: true,
    audioControl: true,
    qualityControl: true,
    withBitrate: false,
    qualitySwitch: 'immediate',
    matcher: defaultMatcher
  }

  constructor(options?: HlsPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load({ $video }: Player, source: Source) {
    const { matcher, forceHLS, library } = this.options

    if (!matcher($video, source, forceHLS)) return false

    if (!HlsPlugin.library) {
      HlsPlugin.library = library
        ? await loadSDK(library, 'Hls')
        : (await import('hls.js/dist/hls.min.js')).default
    }

    if (!HlsPlugin.library.isSupported()) return false

    const { config, errorHandler } = this.options

    this.instance = new HlsPlugin.library(config)
    this.instance.attachMedia($video)

    const { instance, player } = this

    const $source = document.createElement('source')
    $source.setAttribute('src', source.src)
    $source.setAttribute('type', source.type || (source.type = 'application/x-mpegurl'))
    $source.setAttribute('data-hls', '')
    $video.append($source)

    instance.on(HlsPlugin.library.Events.DESTROYING, () => {
      $source.remove()
    })

    instance.on(HlsPlugin.library.Events.ERROR, function (_, data) {
      if (data.fatal) {
        switch (data.type) {
          case 'mediaError':
            instance.recoverMediaError()
            break
          case 'networkError':
          default:
            if (errorHandler) {
              errorHandler(player, data)
            } else {
              player.hasError = true
              player.emit('error', {
                ...data,
                pluginName: PLUGIN_NAME,
                message: data.type + ': ' + (data.reason || data.details)
              })
            }
            break
        }
      }
    })

    instance.on(HlsPlugin.library.Events.LEVEL_LOADED, (_, data) => {
      setTimeout(() => {
        player.emit('canplay', data)
      })
    })

    instance.loadSource(source.src)

    if (player.context.ui?.setting) {
      generateSetting(player, instance, this.options)
    }

    return this
  }

  unload() {
    this.instance?.stopLoad()
  }

  destroy() {
    if (this.instance) {
      const { player, instance } = this
      if (player.context.ui?.setting) removeSetting(player)
      instance.destroy()
    }
  }
}

HlsPlugin.library = (globalThis as any).Hls

export default function create(options?: HlsPluginOptions): PlayerPlugin {
  return new HlsPlugin(options)
}

const generateSetting = (player: Player, instance: Hls, options: HlsPluginOptions = {}) => {
  const ui = player.context.ui
  if (options.qualityControl) {
    instance.once(HlsPlugin.library.Events.LEVEL_LOADED, () => {
      injectSetting({
        icon: ui.icons.quality,
        name: 'Quality',
        settings() {
          if (instance.levels.length > 1) {
            return instance.levels.reduce(
              (pre, level, i) => {
                let name = (level.name || level.height).toString()
                if (isFinite(+name)) name += 'p'
                if (options.withBitrate) {
                  const kb = level.bitrate / 1000
                  const useMb = kb > 1000
                  const number = useMb ? (kb / 1000).toFixed(2) : Math.floor(kb)
                  name += ` (${number}${useMb ? 'm' : 'k'}bps)`
                }
                pre.push({ name, default: instance.currentLevel == i, value: i })
                return pre
              },
              [{ name: player.locales.get('Auto'), default: instance.autoLevelEnabled, value: -1 }]
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

    instance.on(
      HlsPlugin.library.Events.LEVEL_SWITCHED,
      function menuUpdater(_, { level }: LevelSwitchedData) {
        if (instance.autoLevelEnabled) {
          const height = instance.levels[level]!.height
          const levelName = player.locales.get('Auto') + (height ? ` (${height}p)` : '')
          ui.setting.updateLabel(`${PLUGIN_NAME}-Quality`, levelName)
        } else {
          ui.setting.select(`${PLUGIN_NAME}-Quality`, level + 1, false)
        }
      }
    )
  }

  if (options.audioControl)
    instance.on(HlsPlugin.library.Events.LEVEL_LOADED, () => {
      injectSetting({
        icon: ui.icons.lang,
        name: 'Language',
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
    instance.on(HlsPlugin.library.Events.SUBTITLE_TRACK_LOADED, () => {
      injectSetting({
        icon: ui.icons.subtitle,
        name: 'Subtitle',
        settings() {
          if (instance.subtitleTracks.length > 1) {
            return instance.subtitleTracks.reduce(
              (pre, { name, lang, id }) => {
                pre.push({
                  name: lang || name,
                  default: instance.subtitleTrack == id,
                  value: id
                })
                return pre
              },
              [{ name: player.locales.get('Off'), default: !instance.subtitleDisplay, value: -1 }]
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

  function injectSetting(arg: {
    icon: string
    name: string
    settings: () => { name: string; default: boolean; value: any }[] | void
    onChange: (it: { value: any }) => void
  }) {
    const settings = arg.settings()
    if (settings && settings.length < 2) return

    const { name, icon, onChange } = arg

    player.context.ui.setting.unregister(`${PLUGIN_NAME}-${name}`)
    player.context.ui.setting.register({
      name: player.locales.get(name),
      icon,
      onChange,
      type: 'selector',
      key: `${PLUGIN_NAME}-${name}`,
      children: settings
    })
  }
}

const removeSetting = (player: Player) => {
  ;['Quality', 'Language', 'Subtitle'].forEach((it) =>
    player.context.ui.setting.unregister(`${PLUGIN_NAME}-${it}`)
  )
}
