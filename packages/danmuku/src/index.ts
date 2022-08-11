import type { Player, PlayerPlugin } from '@oplayer/core'
import Danmuku from './danmuku'
import type { Options } from './types'

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
        onChange: (flag: boolean) => {
          if (flag) {
            danmuku?.show()
          } else {
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
