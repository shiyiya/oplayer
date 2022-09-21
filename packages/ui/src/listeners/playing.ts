import type Player from '@oplayer/core'
import { playing } from '../style'

const playingListener = (player: Player) => {
  player.on('play', () => {
    player.$root.classList.add(playing)
  })

  player.on(['pause', 'videosourcechange'], () => {
    player.$root.classList.remove(playing)
  })
}

const isPlaying = (player: Player) => player.$root.classList.contains(playing)

export { playingListener, isPlaying }
