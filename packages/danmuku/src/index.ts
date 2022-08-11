import type { Player, PlayerPlugin } from '@oplayer/core'
import Danmuku from './danmuku'
import type { Options } from './types'

export * from './types'

export default (option: Options): PlayerPlugin => ({
  name: 'oplayer-plugin-danmuku',
  apply: (player: Player) => {
    const danmuku = new Danmuku(player, option)

    player.on('ui/setting:loaded', function () {
      player.emit('addsetting', {
        name: 'Danmuku',
        type: 'switcher',
        default: true,
        onChange: (flag: boolean) => {
          if (flag) {
            danmuku.show()
          } else {
            danmuku.hide()
          }
        }
        //TODO:
        // children: [
        //   {
        //     type: 'toggle',
        //     name: 'Display'
        //   },
        //   {
        //     type: 'slider',
        //     name: 'Size'
        //   },
        //   {
        //     type: 'slider',
        //     name: 'Opacity'
        //   },
        // ]
      })
    })

    player.on('videosourcechange', function () {
      danmuku.destroy()
      // TODO: 更新设置内字幕选项
    })
  }
})
