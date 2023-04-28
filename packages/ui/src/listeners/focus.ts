import type Player from '@oplayer/core'
import { focused } from '../style'

const focusListener = (player: Player, autoFocus: boolean) => {
  function focus({ target }: FocusEvent) {
    if (target && (player.$root.contains(target as Node) || player.$root == target)) {
      player.$root.classList.add(focused)
    } else {
      player.$root.classList.remove(focused)
    }
  }

  if (autoFocus) player.$root.classList.add(focused)

  document.addEventListener('click', focus)
  document.addEventListener('contextmenu', focus)
  player.on('destroy', () => {
    document.removeEventListener('click', focus)
    document.removeEventListener('contextmenu', focus)
  })
}

const isFocused = (player: Player) => player.$root.classList.contains(focused)

export { focusListener, isFocused }
