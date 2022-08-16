import type { Player, PlayerPlugin } from '@oplayer/core'
import Danmuku from './danmuku'
import type { Options } from './types'
// @ts-ignore
import subtitleSvg from './danmuku.svg?raw'

export * from './types'

export default (option: Options): PlayerPlugin => ({
  name: 'oplayer-plugin-danmuku',
  apply: (player: Player) => {
    let danmuku: Danmuku | null = new Danmuku(player, option)

    const emitSetting = () => {
      player.emit('addsetting', {
        name: 'Danmuku',
        type: 'switcher',
        default: true,
        key: 'danmuku',
        icon: subtitleSvg,
        onChange: (flag: boolean, { isInit }: { isInit?: boolean } = {}) => {
          if (flag) {
            !isInit && player.emit('notice', { text: 'Show danmuku' })
            danmuku?.show()
          } else {
            !isInit && player.emit('notice', { text: 'Hide danmuku' })
            danmuku?.hide()
          }
        }
      })
    }

    player.on('ui/setting:loaded', emitSetting)
    player.on('danmukusourcechange', ({ payload }) => {
      player.emit('removesetting', 'danmuku')
      emitSetting()
      danmuku = new Danmuku(player, { ...option, danmuku: payload.danmuku })
    })

    player.on('videosourcechange', function () {
      danmuku?.destroy()
      danmuku = null
      player.emit('removesetting', 'danmuku')
    })
  }
})
