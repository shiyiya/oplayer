import { $, isIOS, isMobile } from '@oplayer/core'
import { Icons } from '../functions/icons'
import { icon, off, on, tooltip, webFullScreen } from '../style'
import { formatTime, screenShot, toggleClass } from '../utils'
import renderVolumeBar from './VolumeBar'

import type { Player } from '@oplayer/core'
import type { UiConfig } from '../types'

import {
  controllerBottom,
  dropdown,
  dropdownHoverable,
  expand,
  time
} from './ControllerBottom.style'

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const [playLabel, pauseLabel, screenshotLabel, pipLabel, fullscreenLabel] = [
    player.locales.get('Play'),
    player.locales.get('Pause'),
    player.locales.get('Screenshot'),
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
              ${Icons.get('play')}
              ${Icons.get('pause')}
            </button>`
          : ''
      }

      <span class=${time}>${
      player.options.isLive || player.$video.preload == 'none' ? '00:00' : '00:00 / --:--'
    }</span>
    </div>

    <!-- right -->
    <div>
      <div class="${dropdown} ${dropdownHoverable}">
        <button class="${icon} ${player.isMuted ? on : off}" aria-label="Volume">
            ${Icons.get('volume')[0]}
            ${Icons.get('volume')[1]}
        </button>
        ${!isIOS ? `<div class=${expand}></div>` : ''}
      </div>

      ${
        config.screenshot
          ? `<button class="${icon} ${tooltip}" aria-label="${screenshotLabel}">
              ${Icons.get('screenshot')}
            </button>`
          : ''
      }

      ${
        config.pictureInPicture && player.isPipEnabled
          ? `<button
              class="${icon} ${tooltip} ${player.isInPip ? on : off}"
              aria-label="${pipLabel}">
                ${Icons.get('pip')[0]}
                ${Icons.get('pip')[1]}
            </button>`
          : ''
      }

      ${
        config.fullscreen
          ? `<button class="${icon} ${off} ${tooltip}" data-tooltip-pos="up-right" aria-label="${fullscreenLabel}">
                ${Icons.get('fullscreen')[0]}
                ${Icons.get('fullscreen')[1]}
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
  const $pip = $dom.querySelector<HTMLButtonElement>(`button[aria-label="${pipLabel}"]`)!

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
  player.on(['durationchange', 'timeupdate', 'seeking', 'seeked'], () => {
    $time.innerText = `${formatTime(player.currentTime)} ${
      player.options.isLive ? '' : `/ ${formatTime(player.duration)}`
    }`
  })

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
        switcher($pip, !player.isInPip)
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
      default:
        break
    }
  })

  $.render($dom, el)
}

export default render
