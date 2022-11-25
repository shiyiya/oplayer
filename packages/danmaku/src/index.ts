import { isIOS, Player, PlayerPlugin } from '@oplayer/core'
import Danmaku from './danmaku'
import type { Options } from './types'
// @ts-ignore
import danmakuSvg from './danmaku.svg?raw'

export * from './types'

export default (option: Options): PlayerPlugin => ({
  key: 'danmaku',
  name: 'oplayer-plugin-danmaku',
  apply: (player: Player) => {
    if (player.isNativeUI) return

    let isInit = false
    let danmaku: Danmaku | undefined
    let isDanmakuShowing = false
    let enable = option.enable ?? true // default true

    const emitSetting = (enable: boolean) => {
      player.emit('addsetting', {
        name: player.locales.get('Danmaku'),
        type: 'selector',
        default: true,
        key: 'danmaku',
        icon: danmakuSvg,
        children: [
          {
            name: player.locales.get('Display'),
            type: 'switcher',
            default: enable,
            key: 'danmaku-switcher',
            onChange: (value: boolean) => {
              enable = value
              if (value) {
                danmaku?.show()
                if (!danmaku) bootstrap()
              } else {
                danmaku?.hide()
              }
            }
          },
          {
            name: player.locales.get('FontSize'),
            type: 'selector',
            key: 'danmaku-font',
            onChange: ({ value }: any) => {
              danmaku?.setSize(value)
            },
            children: [0.5, 0.75, 1, 1.25].map((it) => ({
              name: player.locales.get(`${it * 100}%`),
              value: it,
              default: it == 1
            }))
          },

          {
            name: player.locales.get('Opacity'),
            type: 'selector',
            key: 'danmaku-opacity',
            onChange: ({ value }: any) => {
              danmaku?.setOpacity(value)
            },
            children: [0.3, 0.5, 0.8, 1].map((it) => ({
              name: player.locales.get(`${it * 100}%`),
              value: it,
              default: it == danmaku?.options?.opacity
            }))
          },
          {
            name: player.locales.get('Display Area'),
            type: 'selector',
            key: 'danmaku-area',
            onChange: ({ value }: any) => {
              danmaku?.setMargin([undefined, 1 - value])
            },
            children: [0.25, 0.5, 0.8, 1].map((it) => ({
              name: player.locales.get(`${it * 100}%`),
              value: it,
              default: it == 1
            }))
          }
        ]
      })
    }

    function bootstrap() {
      danmaku = new Danmaku(player, option)
      if (player.isPlaying) {
        player.on(
          'loadeddanmaku',
          () => {
            setTimeout(() => {
              danmaku?.start()
            })
          },
          { once: true }
        )
      }

      if (!isInit) {
        isInit = true
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
          player.emit('removesetting', 'danmaku')
          emitSetting(enable)
          option = { ...option, ...payload }
          danmaku = new Danmaku(player, option)
        })

        player.on('videosourcechange', function () {
          player.emit('removesetting', 'danmaku')
          danmaku?.destroy()
          danmaku = undefined
        })
      }
    }

    emitSetting(enable)

    if (enable) bootstrap()

    return () => danmaku
  }
})
