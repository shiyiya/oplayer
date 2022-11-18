import Player from '@oplayer/core'
import { fullscreen } from '../style'

export default (player: Player, $root: HTMLDivElement) => {
  player.on('fullscreenchange', () => {
    $root.classList.toggle(fullscreen)
  })
}
