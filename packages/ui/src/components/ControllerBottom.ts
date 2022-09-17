import { $, isIOS, isIpad, isMobile } from '@oplayer/core'
import { icon, webFullScreen } from '../style'
import { formatTime, screenShot, toggleClass } from '../utils'
import renderVolumeBar from './VolumeBar'

import type { Player } from '@oplayer/core'
import type { UiConfig } from '../types'

import expandSvg from '../icons/fullscreen-enter.svg?raw'
import compressSvg from '../icons/fullscreen-exit.svg?raw'
import pauseSvg from '../icons/pause.svg?raw'
import pipSvg from '../icons/pip.svg?raw'
import playSvg from '../icons/play.svg?raw'
import screenshotSvg from '../icons/screenshot.svg?raw'
import volumeOffSvg from '../icons/sound-off.svg?raw'
import volumeSvg from '../icons/sound-on.svg?raw'
import settingsSvg from '../icons/settings.svg?raw'

import {
  controllerBottom,
  dropdown,
  dropdownHoverable,
  expand,
  time,
  on,
  off
} from './ControllerBottom.style'

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const $dom = $.create(
    `div.${controllerBottom}`,
    {},
    `<div>
      ${
        !isMobile
          ? `<button aria-label="Play" class="${icon} ${player.isPlaying ? on : off}" type="button">
              ${playSvg}
              ${pauseSvg}
            </button>`
          : ''
      }

      <span class=${time}>00:00 / --:--</span>
    </div>

    <!-- right -->
    <div>
      ${
        config.screenshot
          ? `<button aria-label="Screenshot" class="${icon}" type="button">
              ${screenshotSvg}
            </button>`
          : ''
      }

      <div class="${dropdown} ${dropdownHoverable}">
        <button class="${icon} ${player.isMuted ? on : off}" type="button" aria-label="Volume">
            ${volumeSvg}
            ${volumeOffSvg}
        </button>
        <div class=${expand}></div>
      </div>

      <button aria-label="Setting" class=${icon} type="button">
        ${settingsSvg}
      </button>

      ${
        config.pictureInPicture && player.isPipEnabled
          ? `<button aria-label="Picture in Picture" class="${icon}" type="button">
              ${pipSvg}
            </button>`
          : ''
      }

      ${
        config.fullscreen
          ? `<button
                aria-label="${player.isFullscreenEnabled ? 'Fullscreen' : 'WebFullscreen'}"
                class="${icon} ${off}"
                type="button"
              >
                ${expandSvg}
                ${compressSvg}
              </button>`
          : ''
      }
    </div>`
  )

  const $volume = $dom.querySelector<HTMLButtonElement>('button[aria-label="Volume"]')!
  // IOS只能使用物理按键控制音量大小
  if (!isIOS && !isIpad) renderVolumeBar(player, $volume.nextElementSibling! as HTMLDivElement)

  const $play = $dom.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!
  const $fullscreen = $dom.querySelector<HTMLButtonElement>('button[aria-label="Fullscreen"]')!
  const $webFull = $dom.querySelector<HTMLButtonElement>('button[aria-label="WebFullscreen"]')!
  const $time = $dom.querySelector<HTMLSpanElement>('.' + time)!

  const switcher = (el: HTMLElement, display: boolean) => {
    el.classList.add(display ? on : off)
    el.classList.remove(display ? off : on)
  }

  if (config.fullscreen) {
    player.on('fullscreenchange', ({ payload }) =>
      setTimeout(() => {
        if (payload.isWeb) {
          switcher($webFull, toggleClass(player.$root, webFullScreen))
        } else {
          switcher($fullscreen, player.isFullScreen)
        }
      })
    )
  }

  !isMobile && player.on(['play', 'pause'], () => switcher($play, player.isPlaying))
  player.on('volumechange', () => switcher($volume, player.isMuted))

  player.on(['durationchange', 'timeupdate'], () => {
    $time.innerText = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
  })

  player.on('videosourcechange', () => ($time.innerText = '00:00 / --:--'))

  $dom.addEventListener('click', (e: Event) => {
    const target = e.target! as HTMLDivElement
    const label = target.getAttribute('aria-label')

    switch (label) {
      case 'Play':
        return player.togglePlay()
      case 'Volume':
        if (isMobile && !isIOS && !isIpad) return
        if (player.isMuted) {
          player.unmute()
        } else {
          player.mute()
        }
        break
      case 'Picture in Picture':
        return player.togglePip()
      case 'Fullscreen':
        return player.toggleFullScreen()
      case 'WebFullscreen':
        player.emit('fullscreenchange', { isWeb: true })
        break
      case 'Screenshot':
        screenShot(player)
        break
      case 'Setting': {
        player.emit('settingvisibilitychange', e)
        break
      }
      default:
        break
    }
  })

  $.render($dom, el)
}

export default render
