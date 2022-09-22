import type Player from '@oplayer/core'
import { loading } from '../style'
import { isInitialized } from './init'

const loadingListener = (player: Player) => {
  let lastTime = 0
  let currentTime = 0
  let bufferingDetected = false
  let enable = false

  const add = () => player.$root.classList.add(loading)
  const remove = () => player.$root.classList.remove(loading)

  add()
  player.on('videoinitialized', remove)

  player.on('seeking', () => {
    if (!player.isPlaying) {
      add()
      player.on('canplaythrough', remove, { once: true })
    }
  })

  player.on('play', () => (enable = true))

  player.on('pause', () => ((enable = false), remove()))

  player.on('videosourcechange', () => {
    add()
    enable = false
    lastTime = currentTime = 0
  })

  setInterval(() => {
    if (enable && isInitialized(player)) {
      currentTime = player.currentTime

      // loading
      if (!bufferingDetected && currentTime === lastTime && player.isPlaying) {
        add()
        bufferingDetected = true
      }

      if (bufferingDetected && currentTime > lastTime && player.isPlaying) {
        remove()
        bufferingDetected = false
      }
      lastTime = currentTime
    }
  }, 100)
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
