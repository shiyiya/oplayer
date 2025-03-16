import { loadSDK, PartialRequired, type Player, type PlayerPlugin, type Source } from '@oplayer/core'
//@ts-ignore
import type Shaka from 'shaka-player'

export type Matcher = (source: Source) => boolean

export interface ShakaPluginOptions {
  library?: string

  matcher?: Matcher
  /**
   *shaka config
   * @type {object}
   */
  config?: any

  requestFilter?: shaka.extern.RequestFilter

  qualityControl?: boolean

  /**
   * @default: true
   */
  audioControl?: boolean
  /**
   * @default: true
   */
  textControl?: boolean
}

const defaultMatcher: Matcher = (source) => {
  if (source.format && ['m3u8', 'mdp', 'shaka'].includes(source.format)) {
    return true
  }
  return (
    (source.format === 'auto' || typeof source.format === 'undefined') &&
    /(m3u8|mdp)(#|\?|$)/i.test(source.src)
  )
}

class ShakaPlugin implements PlayerPlugin {
  key = 'shaka'
  name = 'oplayer-plugin-shaka'
  version = __VERSION__

  static library: typeof shaka

  player!: Player

  instance?: shaka.Player

  options: PartialRequired<ShakaPluginOptions, 'matcher'> = {
    matcher: defaultMatcher,
    qualityControl: true,
    audioControl: true,
    textControl: true
  }

  constructor(options?: ShakaPluginOptions) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load(player: Player, source: Source) {
    if (!this.options.matcher(source)) return false

    const { library, config, requestFilter } = this.options

    if (!ShakaPlugin.library) {
      ShakaPlugin.library =
        (globalThis as any).shaka ||
        (library
          ? await loadSDK(library, 'shaka')
          : (await import('shaka-player/dist/shaka-player.compiled')).default)

      ShakaPlugin.library.polyfill.installAll()
    }

    const ShakaPlayer = ShakaPlugin.library.Player

    if (!ShakaPlayer.isBrowserSupported()) return false

    this.instance = new ShakaPlayer()
    await this.instance.attach(player.$video)

    if (config) {
      this.instance.configure(config)
    }

    if (requestFilter) {
      this.instance.getNetworkingEngine()?.registerRequestFilter(requestFilter)
    }

    //TODO: listen quality/audio/text change
    // const listener = new ShakaPlugin.library.util.EventManager()
    // listener.listen(this.instance, `mediaqualitychanged`, (event: any) => {
    //   console.log(event)
    // })

    this.instance.addEventListener('error', function (event) {
      player.emit('error', { pluginName: ShakaPlugin.name, ...event })
    })

    try {
      await this.instance.load(source.src)
    } catch (error: any) {
      player.emit('error', { pluginName: ShakaPlugin.name, ...error })
    }

    if (player.context.ui) {
      setupQuality(player, this.instance, this.options)
    }

    return this
  }

  destroy() {
    ;['Quality', 'Language', 'Subtitle'].forEach((it) =>
      this.player.context.ui.setting.unregister(`${ShakaPlugin.name}-${it}`)
    )
    this.instance?.unload()
    this.instance?.destroy()
  }
}

export default function create(options?: ShakaPluginOptions) {
  return new ShakaPlugin(options)
}

const setupQuality = (player: Player, instance: shaka.Player, options: ShakaPlugin['options']) => {
  if (options.qualityControl) {
    const variantList = instance.getVariantTracks().filter((t) => t.type === 'variant')

    if (variantList.length < 2) return

    const levels = variantList
      .sort((a, b) => {
        if (a.language == b.language) {
          const vsHeight = !(!a.height || !b.height)
          if (vsHeight && a.height == b.height) {
            return a.bandwidth - b.bandwidth
          }
          return !a.height || !b.height ? a.bandwidth - b.bandwidth : a.height - b.height
        }
        return a.language.localeCompare(b.language)
      })
      .map((level) => {
        return {
          name: (level.height || level.bandwidth) + ' ' + level.language,
          default: false,
          value: level
        }
      })
    settingUpdater({
      name: 'Quality',
      icon: player.context.ui.icons.quality,
      settings: [
        {
          name: player.locales.get('Auto'),
          default: true,
          value: -1
        }
      ].concat(levels as any),
      onChange({ value }) {
        const isAuto = value == -1
        instance.configure({ abr: { enabled: isAuto } })
        if (!isAuto) {
          instance.selectVariantTrack(value, /* clearBuffer */ true)
        }
      }
    })
  }

  if (options.audioControl) {
    const variantList = instance.getAudioLanguagesAndRoles()

    if (variantList.length < 2) return

    const current = variantList[0]
    const levels = variantList
      .sort((a, b) => {
        return a.language.localeCompare(b.language)
      })
      .map((level) => {
        return {
          name: level.language,
          default: level == current,
          value: level
        }
      })
    settingUpdater({
      name: 'Language',
      icon: player.context.ui.icons.lang,
      settings: levels,
      onChange({ value }) {
        instance.selectAudioLanguage(value.language, value.role)
      }
    })
  }

  if (options.textControl) {
    const variantList = instance.getTextTracks()

    if (variantList.length < 2) return

    const current = variantList[0]
    const isEnable = instance.isTextTrackVisible()

    const levels = variantList
      .sort((a, b) => {
        return a.language.localeCompare(b.language)
      })
      .map((level) => {
        return {
          name: level.language,
          default: isEnable && level == current,
          value: level
        }
      })

    settingUpdater({
      name: 'Subtitle',
      icon: player.context.ui.icons.subtitle,
      settings: [
        {
          name: player.locales.get('Off'),
          default: !isEnable,
          value: -1
        }
      ].concat(levels as any),
      onChange({ value }) {
        if (value != -1) {
          instance.selectTextTrack(value)
        }
        instance.setTextTrackVisibility(value !== -1)
      }
    })
  }

  function settingUpdater(arg: {
    icon: string
    name: string
    settings: {
      name: string
      default: boolean
      value: any
    }[]
    onChange: (it: { value: any }) => void
  }) {
    const settings = arg.settings
    const { name, icon, onChange } = arg

    player.context.ui.setting.unregister(`${ShakaPlugin.name}-${name}`)
    player.context.ui.setting.register({
      name: player.locales.get(name),
      icon,
      onChange,
      type: 'selector',
      key: `${ShakaPlugin.name}-${name}`,
      children: settings
    })
  }
}
