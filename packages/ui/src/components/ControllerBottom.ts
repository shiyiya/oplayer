import { $, isMobile, isIOS } from '@oplayer/core'
import { icon, off, on, tooltip, webFullScreen } from '../style'
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
  time
} from './ControllerBottom.style'

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const [playLabel, pauseLabel, screenshotLabel, settingLabel, pipLabel, fullscreenLabel] = [
    player.locales.get('Play'),
    player.locales.get('Pause'),
    player.locales.get('Screenshot'),
    player.locales.get('Setting'),
    player.locales.get('Picture in Picture'),
    player.locales.get(player.isFullscreenEnabled ? 'Fullscreen' : 'WebFullscreen')
  ]

  const $dom = $.create(
    `div.${controllerBottom}`,
    {},
    `<div>
      ${
        !isMobile
          ? `<button
              class="${icon} ${player.isPlaying ? on : off} ${tooltip}"
              aria-label="${playLabel}"
            >
              ${playSvg}
              ${pauseSvg}
            </button>`
          : ''
      }

      <span class=${time}>${player.options.isLive ? '00:00' : '00:00 / --:--'}</span>
    </div>

    <!-- right -->
    <div>
      ${
        config.screenshot
          ? `<button class="${icon} ${tooltip}" aria-label="${screenshotLabel}">
              ${screenshotSvg}
            </button>`
          : ''
      }

      <div class="${dropdown} ${dropdownHoverable}">
        <button class="${icon} ${player.isMuted ? on : off}" aria-label="Volume">
            ${volumeSvg}
            ${volumeOffSvg}
        </button>
        ${!isIOS ? `<div class=${expand}></div>` : ''}
      </div>

      <button class="${icon} ${tooltip}" aria-label="${settingLabel}">
        ${settingsSvg}
      </button>

      ${
        config.pictureInPicture && player.isPipEnabled
          ? `<button class="${icon} ${tooltip}" aria-label="${pipLabel}">
                ${pipSvg}
            </button>`
          : ''
      }

      ${
        config.fullscreen
          ? `<button class="${icon} ${off} ${tooltip}" data-tooltip-pos="up-right" aria-label="${fullscreenLabel}">
                ${expandSvg}
                ${compressSvg}
              </button>`
          : ''
      }
    </div>`
  )

  const $volume = $dom.querySelector<HTMLButtonElement>('button[aria-label=Volume]')!
  // IOS只能使用物理按键控制音量大小
  if (!isIOS) renderVolumeBar(player, $volume.nextElementSibling! as HTMLDivElement)

  const $play = $dom.querySelector<HTMLButtonElement>(`button[aria-label=${playLabel}]`)!
  const $time = $dom.querySelector<HTMLSpanElement>('.' + time)!
  const $fullscreen = $dom.querySelector<HTMLButtonElement>(
    `button[aria-label="${fullscreenLabel}"]`
  )!

  const switcher = (el: HTMLElement, display: boolean) => {
    el.classList.add(display ? on : off)
    el.classList.remove(display ? off : on)
  }

  if (config.fullscreen) {
    player.on('fullscreenchange', ({ payload }) =>
      setTimeout(() => {
        if (payload.isWeb) {
          switcher($fullscreen, toggleClass(player.$root, webFullScreen))
        } else {
          switcher($fullscreen, player.isFullScreen)
        }
      })
    )
  }

  if (!isMobile) {
    player.on(['play', 'pause', 'videosourcechange'], () => {
      $play.setAttribute('aria-label', player.isPlaying ? pauseLabel : playLabel)
      switcher($play, player.isPlaying)
    })
  }

  player.on('volumechange', () => switcher($volume, player.isMuted))
  player.on(['durationchange', 'timeupdate'], () => {
    $time.innerText = `${formatTime(player.currentTime)} ${
      player.options.isLive ? '' : ` / ${formatTime(player.duration)}`
    }`
  })

  player.on(
    'videosourcechange',
    () => ($time.innerText = player.options.isLive ? '00:00' : '00:00 / --:--')
  )

  $dom.addEventListener('click', (e: Event) => {
    const target = e.target! as HTMLDivElement
    const label = target.getAttribute('aria-label')

    switch (label) {
      case playLabel:
      case pauseLabel:
        return player.togglePlay()
      case 'Volume':
        if (isMobile && !isIOS) return
        if (player.isMuted) {
          player.unmute()
        } else {
          player.mute()
        }
        break
      case pipLabel:
        return player.togglePip()
      case fullscreenLabel:
        if (player.isFullscreenEnabled) {
          player.toggleFullScreen()
        } else {
          player.emit('fullscreenchange', { isWeb: true })
        }
        return
      case screenshotLabel:
        screenShot(player)
        break
      case settingLabel: {
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
