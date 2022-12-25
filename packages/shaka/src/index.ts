import type Player from '@oplayer/core'
import { PlayerPlugin, Source } from '@oplayer/core'
import type Shaka from 'shaka-player'
import 'shaka-player/dist/controls.css'

const PLUGIN_NAME = 'oplayer-plugin-shaka'

let imported: typeof Shaka = globalThis.shaka

type PluginOptions = {
  ui?: boolean
  uiConfig?: object
  config?: object
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
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
}

const defaultMatcher: PluginOptions['matcher'] = (_, source) => {
  if (source.format === 'm3u8' || source.format === 'mpd' || source.format === 'shaka') {
    return true
  }

  return (
    (source.format === 'auto' || typeof source.format === 'undefined') &&
    /m3u8|mpd(#|\?|$)/i.test(source.src)
  )
}

const plugin = ({
  ui = false,
  uiConfig = {},
  config = {},
  withBitrate = false,
  qualityControl = true,
  qualitySwitch = 'immediate',
  matcher = defaultMatcher
}: PluginOptions = {}): PlayerPlugin => {
  let instance: Shaka.Player | null
  let instanceOverlay: Shaka.ui.Overlay | null

  return {
    name: PLUGIN_NAME,
    key: 'shaka',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (instance) {
        player.plugins.ui?.setting.unregister(PLUGIN_NAME)
        instance.unload()
        instance.destroy()
        instance = null
        player.loader = null
      }

      if (options.loader || !isMatch) return false

      if (!imported) {
        if (ui) {
          imported = await import('shaka-player/dist/shaka-player.ui')
        } else {
          imported = await import('shaka-player/dist/shaka-player.compiled')
        }
        imported.polyfill.installAll()
      }

      if (!imported.Player.isBrowserSupported()) return false

      instance = new imported.Player(player.$video)
      player.loader = instance

      if (ui && !instanceOverlay) {
        instanceOverlay = new imported.ui.Overlay(instance, player.$root, player.$video)
        instanceOverlay.configure(uiConfig)
        instanceOverlay.getControls()
      }

      instance.configure(config)
      instance.load(source.src).then(function () {
        if (!ui && !player.isNativeUI && qualityControl && player.plugins.ui?.setting) {
          generateSetting(player, instance!, { qualityControl, qualitySwitch, withBitrate })
        }
      })

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        if (instance) {
          instanceOverlay?.destroy()
          instance.unload()
          instance.destroy()
          instance = null
        }
      })

      return () => imported
    }
  }
}

//TODO lang & audio track
function generateSetting(player: Player, instance: Shaka.Player, options: Options = {}) {
  const langLevels = instance.getVariantTracks().filter((it) => it.type === 'variant')
  const active = langLevels.findIndex((it) => it.active == true)
  const levels = langLevels
    .filter((it) => it.language == langLevels[active]!.language)
    .sort((a, b) => a.videoBandwidth! - b.videoBandwidth!)

  const settingOptions = [
    {
      name: player.locales.get('Auto'),
      default: true,
      value: -1
    }
  ]

  if (levels.length > 1) {
    levels.forEach((level) => {
      let name = (level.label || level.height || 'unknown').toString()
      if (isFinite(+name)) name += 'p'

      if (options.withBitrate && level.videoBandwidth) {
        const kb = level.videoBandwidth / 1000
        const useMb = kb > 1000
        const number = useMb ? ~~(kb / 1000) : Math.floor(kb)
        name += ` (${number}${useMb ? 'm' : 'k'}bps)`
      }

      return settingOptions.push({ name, default: false, value: level.id })
    })

    player.plugins.ui.setting.unregister(PLUGIN_NAME)
    player.plugins.ui.setting.register({
      name: player.locales.get('Quality'),
      type: 'selector',
      key: PLUGIN_NAME,
      icon: player.plugins.ui.icons.quality,
      children: settingOptions,
      onChange: ({ value }: typeof settingOptions[number]) => {
        if (value == -1) {
          instance.configure({ abr: { enabled: true } })
        } else {
          const tracks = instance
            .getVariantTracks()
            .filter((t) => t.id === value && t.type === 'variant')
          instance.selectVariantTrack(tracks[0]!, options.qualitySwitch == 'immediate')
        }
      }
    })
  }

  if (levels.length < 2) return

  //TODO: listen level switch

  // levels.forEach(function (level, index) {
  //   const track = level

  //   let label = ''
  //   if (level.height >= 2160) {
  //     label = ' (4k)'
  //   } else if (level.height >= 1440) {
  //     label = ' (2k)'
  //   } else if (level.height >= 720) {
  //     label = ' (HD)'
  //   }
  //   track.label = level.height + 'p' + label

  //   tracks.push(track)
  // })
}

// function responseFilter(shaka: Shaka.Player) {
//   shaka.getNetworkingEngine()?.clearAllResponseFilters()
//   shaka.getNetworkingEngine()?.registerResponseFilter((type, resp) => {
//     if (type === imported.net.NetworkingEngine.RequestType.LICENSE) {
//       const jsonResp = JSON.parse(
//         String.fromCharCode.apply(null, new Uint8Array(resp.data as any) as any)
//       )
//       const raw = Buffer.from(jsonResp.ckc, 'base64')
//       const rawLength = raw.length
//       const data = new Uint8Array(new ArrayBuffer(rawLength))
//       for (let i = 0; i < rawLength; i += 1) {
//         data[i] = raw[i]!
//       }
//       resp.data = data
//     }
//   })
// }

export default plugin
