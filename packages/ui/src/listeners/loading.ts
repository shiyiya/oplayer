import type Player from '@oplayer/core'
import { loading } from '../style'
import { isInitialed } from './init'

const loadingListener = (player: Player) => {
  let lastTime = 0
  let currentTime = 0
  let bufferingDetected = false
  let enable = false

  const show = () => player.$root.classList.add(loading)
  const hide = () => player.$root.classList.remove(loading)

  player.$root.classList.add(loading)
  player.on('videoinitialized', hide)

  setInterval(() => {
    if (enable && isInitialed(player)) {
      currentTime = player.currentTime

      // loading
      if (!bufferingDetected && currentTime === lastTime && player.isPlaying) {
        show()
        bufferingDetected = true
      }

      if (bufferingDetected && currentTime > lastTime && player.isPlaying) {
        player.$root.classList.remove(loading)
        bufferingDetected = false
      }
      lastTime = currentTime
    }
  }, 100)

  player.on('seeking', () => {
    if (!player.isPlaying) {
      show()
      player.on('canplaythrough', hide, { once: true })
    }
  })

  player.on(['videosourcechange', 'pause', 'play', 'ended'], (e) => {
    if (enable && e.type == 'pause') hide
    enable = e.type != 'pause'
  })

  player.on('videosourcechange', () => {
    lastTime = currentTime = 0
  })
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
