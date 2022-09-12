import { isIOS, Player, PlayerPlugin } from '@oplayer/core'
import Danmaku from './danmaku'
import type { Options } from './types'
// @ts-ignore
import subtitleSvg from './danmaku.svg?raw'

export * from './types'

export default (option: Options): PlayerPlugin => ({
  name: 'oplayer-plugin-danmaku',
  apply: (player: Player) => {
    let danmaku: Danmaku = new Danmaku(player, option)
    let isDanmakuShowing = false

    const emitSetting = () => {
      player.emit('addsetting', {
        name: player.locales.get('Danmaku'),
        type: 'selector',
        default: true,
        key: 'danmaku',
        icon: subtitleSvg,
        children: [
          {
            name: player.locales.get('字体大小'),
            type: 'selector',
            key: 'danmaku-font',
            children: [
              {
                name: player.locales.get('大'),
                type: 'switcher'
              },
              {
                name: player.locales.get('中'),
                type: 'switcher',
                default: true
              },
              {
                name: player.locales.get('小'),
                type: 'switcher'
              }
            ]
          },
          {
            name: player.locales.get('显示区域'),
            type: 'selector',
            key: 'danmaku-area',
            children: [
              {
                name: player.locales.get('1/4'),
                type: 'switcher'
              },
              {
                name: player.locales.get('1/2'),
                type: 'switcher'
              },
              {
                name: player.locales.get('3/4'),
                type: 'switcher'
              },
              {
                name: player.locales.get('unlimited'),
                type: 'switcher',
                default: true
              }
            ]
          },
          {
            name: player.locales.get('透明度'),
            type: 'selector',
            key: 'danmaku-opacity',
            children: [
              {
                name: player.locales.get('1'),
                type: 'switcher',
                default: true
              },
              {
                name: player.locales.get('0.8'),
                type: 'switcher'
              },
              {
                name: player.locales.get('0.5'),
                type: 'switcher'
              },
              {
                name: player.locales.get('0.3'),
                type: 'switcher'
              }
            ]
          }
        ]
      })
    }

    player.on('loadedsetting', emitSetting)
    player.on(['play', 'playing'], danmaku.start.bind(danmaku))
    player.on(['pause', 'waiting'], danmaku.stop.bind(danmaku))
    player.on(['webfullscreen', 'seeking'], danmaku.reset.bind(danmaku))
    player.on('destroy', danmaku.destroy)
    player.on('fullscreenchange', () => {
      setTimeout(() => {
        if (isIOS()) {
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
      emitSetting()
      danmaku = new Danmaku(player, { ...option, ...payload, source: payload.source })
    })

    player.on('videosourcechange', function () {
      danmaku?.destroy()
      danmaku = null as any
      player.emit('removesetting', 'danmaku')
    })
  }
})
