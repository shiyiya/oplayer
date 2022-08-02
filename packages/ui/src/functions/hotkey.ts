import type Player from '@oplayer/core'
import { focusListener } from '../listeners/focus'
import { webFullScreen } from '../style'

const VOLUME_SETUP = 0.1
const SEEK_SETUP = 5

const HOTKEY_FN = {
  ArrowUp: (player: Player) => player.setVolume(player.volume + VOLUME_SETUP),
  ArrowDown: (player: Player) => player.setVolume(player.volume - VOLUME_SETUP),

  ArrowLeft: (player: Player) => player.seek(player.currentTime - SEEK_SETUP),
  ArrowRight: (player: Player) => player.seek(player.currentTime + SEEK_SETUP),

  ' ': (player: Player) => player.togglePlay(),

  Escape: (player: Player) => {
    if (player.isFullScreen) {
      player.exitFullscreen()
      return
    }
    if (player.$root.classList.contains(webFullScreen)) {
      player.emit('webfullscreen')
    }
  }
}

export default function hotKey(player: Player) {
  function keydown(e: KeyboardEvent) {
    if (document.activeElement?.getAttribute('contenteditable') || !focusListener.isFocus()) return

    if (HOTKEY_FN[e.key as keyof typeof HOTKEY_FN]) {
      e.preventDefault()
      HOTKEY_FN[e.key as keyof typeof HOTKEY_FN](player)
    }
  }

  document.addEventListener('keydown', keydown)
  player.on('destroy', () => {
    document.removeEventListener('keydown', keydown)
  })
}
