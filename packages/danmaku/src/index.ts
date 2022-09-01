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
        type: 'switcher',
        default: true,
        key: 'danmaku',
        icon: subtitleSvg,
        onChange: (flag: boolean) => {
          if (flag) {
            danmaku?.show()
            isDanmakuShowing = true
          } else {
            danmaku?.hide()
            isDanmakuShowing = false
          }
        }
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
            danmaku.hide()
          } else {
            if (isDanmakuShowing) danmaku.show()
          }
        } else {
          danmaku.reset()
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
