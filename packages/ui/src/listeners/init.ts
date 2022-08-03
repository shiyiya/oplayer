import type Player from '@oplayer/core'
import { isMobile } from '../utils'

const initListener = (() => {
  let isInit = false
  let before = <Function[]>[]
  let after = <Function[]>[]

  const initStart = () => {
    isInit = false
    before.forEach((f) => f())
  }

  const initEnd = () => {
    if (isInit) return
    isInit = true
    after.forEach((f) => f())
  }

  return {
    isInit: () => isInit,
    startListening: function listener(player: Player) {
      initStart()
      // https://www.cnblogs.com/taoze/p/5783928.html
      if (isMobile) {
        player.on('durationchange', function durationchange() {
          if (
            player.duration !== 1 &&
            player.duration !== Infinity &&
            player.duration != NaN &&
            player.duration > 1
          ) {
            initEnd()
          }
        })
      } else {
        player.on('canplaythrough', initEnd)
      }

      player.on('videosourcechange', initStart)
    },
    add: (be: Function, af: Function) => {
      before.push(be)
      after.push(af)
    }
  }
})()

export default initListener
