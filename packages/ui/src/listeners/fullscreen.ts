import Player from '@oplayer/core'
import { fullscreen, webFullScreen } from '../style'

export default (player: Player) => {
  player.on('fullscreenchange', ({ payload }) => {
    if (payload.isWeb) {
      player.$root.classList.toggle(webFullScreen)
    } else {
      if (!player._requestFullscreen) return
      player.$root.classList.toggle(fullscreen)
    }
  })
}

export const isFullscreen = (player: Player) =>
  player.$root.classList.contains(fullscreen) || player.$root.classList.contains(webFullScreen)

export const isWebFullscreen = (player: Player) => player.$root.classList.contains(webFullScreen)
