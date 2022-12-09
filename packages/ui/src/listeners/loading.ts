import type Player from '@oplayer/core'
import { loading } from '../style'

const loadingListener = (player: Player) => {
  const add = () => player.$root.classList.add(loading)
  const remove = () => player.$root.classList.remove(loading)

  if (player.$video.preload != 'none') {
    add()
  }

  // 'loadstart', // preload none 不触发
  player.on(['waiting', 'seeking', 'videosourcechange', 'videoqualitychange'], add)

  player.on(['loadedmetadata', 'canplay', 'pause', 'seeked', 'error'], remove)
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
