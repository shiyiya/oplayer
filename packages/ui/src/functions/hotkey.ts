import type { Player, PlayerEvent } from '@oplayer/core'
import focusListener from '../listeners/focus'
import { webFullScreen } from '../style'
import { screenShot } from '../utils'

const VOLUME_SETUP = 10 //10% 0.1 有精度问题
const SEEK_SETUP = 5

const HOTKEY_FN: Record<string, (player: Player) => void> = {
  ArrowUp: (player: Player) => {
    const nextVolume = player.volume * 100 + VOLUME_SETUP
    player.setVolume(nextVolume / 100)
    player.emit('notice', { text: player.locales.get('Volume: %s', `${player.volume * 100}%`) })
  },
  ArrowDown: (player: Player) => {
    const nextVolume = player.volume * 100 - VOLUME_SETUP
    player.setVolume(nextVolume / 100)
    player.emit('notice', { text: player.locales.get('Volume: %s', `${player.volume * 100}%`) })
  },

  ArrowLeft: (player: Player) => player.emit('notice', { text: `-${SEEK_SETUP}s` }),
  ArrowRight: (player: Player) => player.emit('notice', { text: `+${SEEK_SETUP}s` }),

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

export default function hotKey(player: Player) {
  let preKey: string | undefined

  function keydown(e: KeyboardEvent) {
    if (document.activeElement?.getAttribute('contenteditable') || !focusListener.isFocus()) return

    const key = e.key

    if (HOTKEY_FN[key]) {
      e.preventDefault()
      HOTKEY_FN[key!]!(player)
    }

    //double key
    if (preKey && preKey === key && HOTKEY_FN[`${preKey}+${key}`]) {
      e.preventDefault()
      HOTKEY_FN[`${preKey}+${key}`]!(player)
    }

    preKey = key
    setTimeout(() => {
      preKey = undefined
    }, 200)
  }

  player.on('addhotkey', ({ payload }: PlayerEvent) => {
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        HOTKEY_FN[key] = payload[key]
      }
    }
  })

  player.on('removehotkey', ({ payload }: PlayerEvent) => {
    ;(<string[]>payload).forEach((k) => {
      delete HOTKEY_FN[k]
    })
  })

  document.addEventListener('keydown', keydown)
  player.on('destroy', () => {
    document.removeEventListener('keydown', keydown)
  })
}
