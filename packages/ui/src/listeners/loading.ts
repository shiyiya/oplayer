import type Player from '@oplayer/core'
import { isMobile } from '@oplayer/core'
import { loading } from '../style'

const loadingListener = (player: Player) => {
  const add = () => player.$root.classList.add(loading)
  const remove = () => {
    if (!player.isLoaderLoading) {
      player.$root.classList.remove(loading)
    }
  }

  if (player.$video.preload != 'none') {
    add()
  }

  player.on('loadstart', () => {
    if (player.$video.preload == 'none') remove()
  })

  if (isMobile) {
    detectLoading(player, add, remove)
  } else {
    player.on(['waiting', 'seeking', 'videosourcechange', 'videoqualitychange'], add)
    player.on(['loadedmetadata', 'canplay', 'pause', 'seeked', 'error'], remove)
  }
}

// 主动检测是否loading 手机上事件都不靠谱
const detectLoading = (player: Player, add: Function, remove: Function) => {
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
  player.on('pause', () => ((enable = false), remove()))

  player.on('loadedmetadata', remove)

  player.on(['videosourcechange', 'videoqualitychange'], () => {
    add()
    enable = false
    lastTime = currentTime = 0
  })

  const timer = setInterval(() => {
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
  }, 100)

  player.on('destroy', () => {
    clearInterval(timer)
  })
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
