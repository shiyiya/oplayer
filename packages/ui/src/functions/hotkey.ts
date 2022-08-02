import type Player from '@oplayer/core'
import { focusListener } from '../listeners/focus'
import { webFullScreen } from '../style'
import { screenShot } from '../utils'

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
  },

  's+s': screenShot
}

type HotKeyName = keyof typeof HOTKEY_FN

let preKey: string | undefined

export default function hotKey(player: Player) {
  function keydown(e: KeyboardEvent) {
    if (document.activeElement?.getAttribute('contenteditable') || !focusListener.isFocus()) return

    const key = e.key as HotKeyName

    if (HOTKEY_FN[key]) {
      e.preventDefault()
      HOTKEY_FN[key](player)
    }

    //double key
    if (preKey && preKey === key && HOTKEY_FN[`${preKey}+${key}` as HotKeyName]) {
      e.preventDefault()
      HOTKEY_FN[`${preKey}+${key}` as HotKeyName](player)
    }

    preKey = key
    setTimeout(() => {
      preKey = undefined
    }, 200)
  }

  document.addEventListener('keydown', keydown)
  player.on('destroy', () => {
    document.removeEventListener('keydown', keydown)
  })
}
