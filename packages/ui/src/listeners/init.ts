import type Player from '@oplayer/core'
import { isMobile } from '@oplayer/core'
import { initialized } from '../style'

const initListener = (player: Player) => {
  let isInitialized = false

  const initStart = () => {
    if (isInitialized) player.$root.classList.remove(initialized)
    isInitialized = false
  }

  const initEnd = () => {
    if (isInitialized) return
    isInitialized = true
    player.$root.classList.add(initialized)
  }

  if (isMobile) {
    player.on('durationchange', function durationchange() {
      if (player.duration !== Infinity && player.duration > 0) {
        initEnd()
      }
    })
  } else {
    player.on('canplaythrough', initEnd)
  }

  player.on('videosourcechange', initStart)
}

const isInitialed = (player: Player) => player.$root.classList.contains(initialized)

export { initListener, isInitialed }
