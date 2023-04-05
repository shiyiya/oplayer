import type Player from '@oplayer/core'
import { isMobile } from '@oplayer/core'
import { loading } from '../style'
import { canplay } from '../utils'

const loadingListener = (player: Player, detect = true) => {
  const add = () => player.$root.classList.add(loading)
  const remove = () => {
    if (!player.isSourceChanging) {
      player.$root.classList.remove(loading)
    }
  }

  if (player.$video.preload != 'none') {
    add()
  }

  player.on('loadstart', () => {
    if (player.$video.preload == 'none') remove()
  })

  player.on(['videoqualitychange', 'videosourcechange', 'stalled'], add)

  if (isMobile && detect) {
    detectLoading(player, add, remove)
  } else {
    player.on(['waiting', 'seeking'], add)
    player.on([canplay, 'pause', 'seeked', 'error'], remove)
  }
}

const detectLoading = (player: Player, add: any, remove: any) => {
  let lastTime = 0
  let currentTime = 0
  let bufferingDetected = false
  let enable = false

  player.on('seeking', () => {
    if (!player.isPlaying) {
      add()
      player.on('seeked', remove, { once: true })
    }
  })

  player.on('play', () => (enable = true))
  player.on(['pause', 'error'], () => ((enable = false), remove()))

  player.on(canplay, remove)

  player.on(['videosourcechange', 'videoqualitychange'], () => {
    enable = false
    lastTime = currentTime = 0
  })

  const requestAnimationFrame =
    window.requestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    function (cb) {
      return setTimeout(cb, 50 / 3)
    }

  ;(function raf() {
    return requestAnimationFrame(() => {
      if (enable) {
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

      if (player.$video) raf()
    })
  })()
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
