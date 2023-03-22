import type Player from '@oplayer/core'
import { PlayerPlugin } from '@oplayer/core'

export default class HelloPlugin implements PlayerPlugin {
  key = 'hello'
  name = 'oplayer-plugin-hello'

  apply(player: Player) {
    this.say()

    player.on('play', () => {
      console.log('enjoy the video!')
    })
  }

  say(who = this.name) {
    console.log(`hello! ${who}`)
  }

  destroy() {
    console.log('bye bye!')
  }
}
// treeshaking testing
