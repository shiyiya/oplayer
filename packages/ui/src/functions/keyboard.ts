import type { Player } from '@oplayer/core'
import { isFocused } from '../listeners/focus'
import { webFullScreen } from '../style'
import { UiConfig } from '../types'
import { formatTime, screenShot } from '../utils'

const VOLUME_SETUP = 10 //10% 0.1 有精度问题
const SEEK_SETUP = 5

const KEY_FN: Record<string, (player: Player) => void> = {
  ArrowUp: (player: Player) => {
    const nextVolume = player.volume * 100 + VOLUME_SETUP
    player.setVolume(nextVolume / 100)
    player.emit('notice', { text: player.locales.get('Volume: %s', `${~~(player.volume * 100)}%`) })
  },
  ArrowDown: (player: Player) => {
    const nextVolume = player.volume * 100 - VOLUME_SETUP
    player.setVolume(nextVolume / 100)
    player.emit('notice', { text: player.locales.get('Volume: %s', `${~~(player.volume * 100)}%`) })
  },

  ArrowLeft: (player: Player) => {
    if (player.options.isLive || player.hasError) return
    const tar = player.currentTime - SEEK_SETUP
    if (tar < 0) {
      player.seek(0)
    } else {
      player.seek(player.currentTime - SEEK_SETUP)
    }

    player.emit('notice', {
      text: `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
    })
  },
  ArrowRight: (player: Player) => {
    if (player.options.isLive || player.hasError) return
    player.seek(player.currentTime + SEEK_SETUP)

    player.emit('notice', {
      text: `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
    })
  },

  ' ': (player: Player) => player.togglePlay(),

  Escape: (player: Player) => {
    if (player.isFullScreen) {
      player.exitFullscreen()
      return
    }
    if (player.$root.classList.contains(webFullScreen)) {
      player.emit('fullscreenchange', { isWeb: true })
    }
  },

  f: (player: Player) => player.toggleFullScreen(),

  s: screenShot
}

export default function (player: Player, config: UiConfig) {
  let preKey: string | undefined

  function keydown(e: KeyboardEvent) {
    if (
      document.activeElement?.tagName == 'INPUT' ||
      document.activeElement?.getAttribute('contenteditable') ||
      (!config.keyboard?.global && !config.keyboard?.focused) ||
      (config.keyboard.focused && !isFocused(player))
    ) {
      return
    }

    const key = e.key

    if (KEY_FN[key]) {
      e.preventDefault()
      KEY_FN[key!]!(player)
    }

    //double key
    if (preKey && preKey === key && KEY_FN[`${preKey}+${key}`]) {
      e.preventDefault()
      KEY_FN[`${preKey}+${key}`]!(player)
    }

    preKey = key
    setTimeout(() => {
      preKey = undefined
    }, 200)
  }

  function register(payload: any) {
    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        KEY_FN[key] = payload[key]
      }
    }
  }

  function unRegister(payload: string[]) {
    payload.forEach((k) => {
      delete KEY_FN[k]
    })
  }

  document.addEventListener('keydown', keydown)
  player.on('destroy', () => {
    document.removeEventListener('keydown', keydown)
  })

  return { register, unRegister }
}
