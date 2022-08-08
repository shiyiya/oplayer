import type { Player, PlayerPlugin } from '@oplayer/core'
import Danmuku from './danmuku'

export * from './types'

export default (option: any): PlayerPlugin => ({
  name: 'oplayer-plugin-danmuku',
  apply: (player: Player) => {
    new Danmuku(player, option)
  }
})
