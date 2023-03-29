import type Player from '@oplayer/core'
import { PlayerPlugin } from '@oplayer/core'

export default class HelloPlugin implements PlayerPlugin {
  key = 'hello'
  name = 'oplayer-plugin-hello'

  apply(player: Player) {
    player.on('play', () => {
      console.log('enjoy the video!')
    })

    return this
  }

  say(who = this.name) {
    console.log(`hello! ${who}`)
  }

  destroy() {
    console.log('bye bye!')
  }
}
// treeshaking testing
