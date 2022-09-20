import type Player from '@oplayer/core'
import { loading } from '../style'
import { isInitialed } from './init'

const loadingListener = (player: Player) => {
  let lastTime = 0
  let currentTime = 0
  let bufferingDetected = false
  let enable = false

  setInterval(() => {
    if (enable && isInitialed(player)) {
      currentTime = player.currentTime

      // loading
      if (!bufferingDetected && currentTime === lastTime && player.isPlaying) {
        player.$root.classList.add(loading)
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
      player.$root.classList.add(loading)
      player.on('canplaythrough', () => player.$root.classList.remove(loading), { once: true })
    }
  })

  player.on(['videosourcechange', 'pause', 'play', 'ended'], (e) => {
    if (enable && e.type == 'pause') player.$root.classList.remove(loading)
    enable = e.type != 'pause'
  })

  player.on('videosourcechange', () => {
    lastTime = currentTime = 0
  })
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
