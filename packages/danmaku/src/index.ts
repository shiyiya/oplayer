import { Player, PlayerPlugin } from '@oplayer/core'
import Danmaku from './danmaku'
import type { Options } from './types'

export * from './types'

export default (option = {} as Options): PlayerPlugin => ({
  key: 'danmaku',
  name: 'oplayer-plugin-danmaku',
  apply: (player: Player) => {
    if (player.isNativeUI) return
    return new Danmaku(player, option)
  }
})
