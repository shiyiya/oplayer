import type Player from '@oplayer/core'
import { PlayerPlugin, Source } from '@oplayer/core'
import type Shaka from 'shaka-player'

const PLUGIN_NAME = 'oplayer-plugin-shaka'

let imported: typeof Shaka = globalThis.shaka

type PluginOptions = {
  shakaConfig: object
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

const defaultMatcher: PluginOptions['matcher'] = (_, source) => {
  return /m3u8(#|\?|$)/i.test(source.src) || /mpd(#|\?|$)/i.test(source.src)
}

const plugin = (options: PluginOptions): PlayerPlugin => {
  const { shakaConfig, matcher = defaultMatcher } = options || {}
  let instance: Shaka.Player | null

  return {
    name: PLUGIN_NAME,
    key: 'shaka',
    load: async (player, source, options) => {
      const isMatch = matcher(player.$video, source)

      if (instance) {
        player.plugins.ui?.setting.unregister(PLUGIN_NAME)
        instance.unload()
        instance.destroy()
        instance = null as any
      }

      if (options.loader || !isMatch) return false

      if (!imported) {
        imported = await import('shaka-player/dist/shaka-player.compiled')
        imported.polyfill.installAll()
      }

      if (!imported.Player.isBrowserSupported()) return false

      instance = new imported.Player(player.$video)
      instance.configure(shakaConfig)
      instance.load(source.src).then((_) => {
        registerSetting(player, instance!)
      })

      return true
    },
    apply: (player) => {
      player.on('destroy', () => {
        if (instance) {
          instance.unload()
          instance.destroy()
          instance = null as any
        }
      })

      return {
        value: () => instance,
        constructor: () => imported
      }
    }
  }
}

function registerSetting(player: Player, shakaPlayer: Shaka.Player) {
  const levels = shakaPlayer.getVariantTracks().filter((it) => it.type === 'variant')

  const settingOptions = [
    {
      name: player.locales.get('Auto'),
      default: true,
      value: -1
    }
  ]

  if (levels.length > 1) {
    levels.forEach((level, i) => {
      let name = (level.label || level.height || 'unknown').toString()
      if (isFinite(+name)) name += 'p'

      return settingOptions.push({ name, default: false, value: i })
    })
  }

  player.plugins.ui?.setting.unregister(PLUGIN_NAME)
  player.plugins.ui?.setting.register({
    name: player.locales.get('Quality'),
    type: 'selector',
    key: PLUGIN_NAME,
    icon: player.plugins.ui.icons.quality,
    children: settingOptions,
    onChange: ({ value }: typeof settingOptions[number]) => {
      console.log(1)

      shakaPlayer.configure({
        abr: { enabled: value === -1 }
      })

      const tracks = shakaPlayer
        .getVariantTracks()
        .filter((t) => t.id === value && t.type === 'variant')

      shakaPlayer.selectVariantTrack(tracks[0]!, /* clearBuffer */ true)
    }
  })

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
