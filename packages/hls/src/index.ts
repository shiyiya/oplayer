import { loadSDK, type Player, type PlayerPlugin, type RequiredPartial, type Source } from '@oplayer/core'
import type Hls from 'hls.js'
import type { ErrorData, HlsConfig, LevelSwitchedData, Level, MediaPlaylist } from 'hls.js'

const PLUGIN_NAME = 'oplayer-plugin-hls'

export type Matcher = (video: HTMLVideoElement, source: Source, forceHLS: boolean) => boolean

export interface HlsPluginOptions {
  library?: string

  matcher?: Matcher

  /**
   * default auto
   */
  defaultQuality?: (levels: Level[]) => number

  /**
   * default browser language
   */
  defaultAudio?: (tracks: MediaPlaylist[]) => number

  /**
   * default browser language
   */
  defaultSubtitle?: (tracks: MediaPlaylist[]) => number

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
    matcher: defaultMatcher,
    defaultQuality: () => -1,
    defaultAudio: () => -1,
    defaultSubtitle: () => -1
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
      HlsPlugin.library =
        (globalThis as any).Hls ||
        (library ? await loadSDK(library, 'Hls') : (await import('hls.js/dist/hls.min.js')).default)
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

export default function create(options?: HlsPluginOptions) {
  return new HlsPlugin(options)
}

const generateSetting = (player: Player, instance: Hls, options: HlsPlugin['options']) => {
  const ui = player.context.ui
  if (options.qualityControl) {
    instance.once(HlsPlugin.library.Events.LEVEL_LOADED, () => {
      if (instance.levels.length < 2) return
      const defaultLevel = options.defaultQuality(instance.levels.toSorted((a, b) => b.bitrate - a.bitrate))
      if (defaultLevel != -1) instance.currentLevel = defaultLevel

      injectSetting({
        icon: ui.icons.quality,
        name: 'Quality',
        settings() {
          return instance.levels
            .toSorted((a, b) => b.bitrate - a.bitrate)
            .reduce(
              (pre, level, id) => {
                let name = (level.name || level.height).toString()
                if (isFinite(+name)) name += 'p'
                if (options.withBitrate) {
                  const kb = level.bitrate / 1000
                  const useMb = kb > 1000
                  const number = useMb ? (kb / 1000).toFixed(2) : Math.floor(kb)
                  name += ` (${number}${useMb ? 'm' : 'k'}bps)`
                }

                pre.push({ name, default: defaultLevel == id, value: instance.levels.length - 1 - id })
                return pre
              },
              [{ name: player.locales.get('Auto'), default: instance.autoLevelEnabled, value: -1 }]
            )
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
          ui.setting.select(`${PLUGIN_NAME}-Quality`, level - instance.levels.length, false)
        }
      }
    )
  }

  if (options.audioControl) {
    instance.once(HlsPlugin.library.Events.LEVEL_LOADED, () => {
      if (instance.audioTracks.length < 2) return

      let defaultAudio: number | undefined = options.defaultAudio(instance.audioTracks)
      if (defaultAudio == -1) {
        defaultAudio = instance.audioTracks.find(({ lang }) => {
          return lang === navigator.language || lang === navigator.language.split('-')[0]
        })?.id
      }

      if (defaultAudio != -1 && defaultAudio != undefined) {
        instance.audioTrack = defaultAudio
      }

      injectSetting({
        icon: ui.icons.lang,
        name: 'Language',
        settings() {
          return instance.audioTracks.map(({ name, lang, id }) => ({
            name: lang || name,
            default: defaultAudio == id,
            value: id
          }))
        },
        onChange(it) {
          instance.audioTrack = it.value
        }
      })
    })
  }

  if (options.textControl)
    instance.once(HlsPlugin.library.Events.SUBTITLE_TRACK_LOADED, () => {
      if (instance.subtitleTracks.length < 2) return

      let defaultSubtitle: number | undefined = options.defaultSubtitle(instance.subtitleTracks)
      if (defaultSubtitle == -1) {
        defaultSubtitle = instance.audioTracks.find(({ lang }) => {
          return lang === navigator.language || lang === navigator.language.split('-')[0]
        })?.id
      }

      if (defaultSubtitle != -1 && defaultSubtitle != undefined) {
        instance.subtitleTrack = defaultSubtitle
      }

      injectSetting({
        icon: ui.icons.subtitle,
        name: 'Subtitle',
        settings() {
          return instance.subtitleTracks.reduce(
            (pre, { name, lang, id }) => {
              pre.push({
                name: lang || name,
                default: defaultSubtitle == id,
                value: id
              })
              return pre
            },
            [{ name: player.locales.get('Off'), default: !instance.subtitleDisplay, value: -1 }]
          )
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
    settings: () => { name: string; default: boolean; value: any }[]
    onChange: (it: { value: any }) => void
  }) {
    const settings = arg.settings()
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
