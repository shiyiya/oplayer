import { isIOS, Player, PlayerPlugin } from '@oplayer/core'
import Danmaku from './danmaku'
import type { Options } from './types'
// @ts-ignore
import subtitleSvg from './danmaku.svg?raw'

export * from './types'

export default (option: Options): PlayerPlugin => ({
  name: 'oplayer-plugin-danmaku',
  apply: (player: Player) => {
    if (player.evil()) return

    let danmaku: Danmaku = new Danmaku(player, option)
    let isDanmakuShowing = false

    const emitSetting = () => {
      player.registerSetting?.({
        name: player.locales.get('Danmaku'),
        type: 'selector',
        default: true,
        key: 'danmaku',
        icon: subtitleSvg,
        children: [
          {
            name: player.locales.get('Display'),
            type: 'switcher',
            default: true,
            key: 'danmaku-switcher',
            onChange: (value: boolean) => {
              if (value) danmaku?.show()
              else danmaku?.hide()
            }
          },
          {
            name: player.locales.get('FontSize'),
            type: 'selector',
            key: 'danmaku-font',
            onChange: ({ value }: any) => {
              danmaku.setSize(value)
            },
            children: [0.5, 0.75, 1, 1.25].map((it) => ({
              name: player.locales.get(`${it * 100}%`),
              type: 'switcher',
              value: it,
              default: it == 1
            }))
          },

          {
            name: player.locales.get('Opacity'),
            type: 'selector',
            key: 'danmaku-opacity',
            onChange: ({ value }: any) => {
              danmaku.setOpacity(value)
            },
            children: [0.3, 0.5, 0.8, 1].map((it) => ({
              name: player.locales.get(`${it * 100}%`),
              type: 'switcher',
              value: it,
              default: it == danmaku.options.opacity
            }))
          },
          {
            name: player.locales.get('Display Area'),
            type: 'selector',
            key: 'danmaku-area',
            onChange: ({ value }: any) => {
              danmaku.setMargin([undefined, 1 - value])
            },
            children: [0.25, 0.5, 0.8, 1].map((it) => ({
              name: player.locales.get(`${it * 100}%`),
              type: 'switcher',
              value: it,
              default: it == 1
            }))
          }
        ]
      })
    }

    emitSetting()
    player.on(['play', 'playing'], () => danmaku?.start())
    player.on(['pause', 'waiting'], () => danmaku?.stop())
    player.on('seeking', () => danmaku?.reset())
    player.on('destroy', () => danmaku?.destroy())
    player.on('fullscreenchange', ({ payload }) => {
      if (payload.isWeb) return danmaku?.reset()
      setTimeout(() => {
        if (isIOS) {
          if (player.isFullScreen) {
            danmaku?.hide()
          } else {
            if (isDanmakuShowing) danmaku?.show()
          }
        } else {
          danmaku?.reset()
        }
      })
    })

    player.on('danmakusourcechange', ({ payload }) => {
      player.unRegisterSetting?.('danmaku')
      emitSetting()
      danmaku = new Danmaku(player, { ...option, ...payload, source: payload.source })
    })

    player.on('videosourcechange', function () {
      danmaku?.destroy()
      danmaku = null as any
      player.unRegisterSetting('danmaku')
    })
  }
})
