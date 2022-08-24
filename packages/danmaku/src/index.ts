import type { Player, PlayerPlugin } from '@oplayer/core'
import Danmaku from './danmaku'
import type { Options } from './types'
// @ts-ignore
import subtitleSvg from './danmaku.svg?raw'

export * from './types'

export default (option: Options): PlayerPlugin => ({
  name: 'oplayer-plugin-danmaku',
  apply: (player: Player) => {
    let danmaku: Danmaku | null = new Danmaku(player, option)

    const emitSetting = () => {
      player.emit('addsetting', {
        name: 'Danmaku',
        type: 'switcher',
        default: true,
        key: 'danmaku',
        icon: subtitleSvg,
        onChange: (flag: boolean, { isInit }: any = {}) => {
          if (flag) {
            !isInit && player.emit('notice', { text: 'Show danmaku' })
            danmaku?.show()
          } else {
            !isInit && player.emit('notice', { text: 'Hide danmaku' })
            danmaku?.hide()
          }
        }
      })
    }

    player.on('loadedsetting', emitSetting)
    player.on('danmakusourcechange', ({ payload }) => {
      player.emit('removesetting', 'danmaku')
      emitSetting()
      danmaku = new Danmaku(player, { ...option, ...payload, source: payload.source })
    })

    player.on('videosourcechange', function () {
      danmaku?.destroy()
      danmaku = null
      player.emit('removesetting', 'danmaku')
    })
  }
})
