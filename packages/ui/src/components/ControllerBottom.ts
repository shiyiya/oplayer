import { $, isMobile } from '@oplayer/core'
import { icon, webFullScreen } from '../style'
import { formatTime, screenShot, siblings, toggleClass } from '../utils'
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
import webExpandSvg from '../icons/webfullscreen-enter.svg?raw'
import webCompressSvg from '../icons/webfullscreen-exit.svg?raw'
import settingsSvg from '../icons/settings.svg?raw'

import {
  controllerBottom,
  dropdown,
  dropdownHoverable,
  dropItem,
  expand,
  time
} from './ControllerBottom.style'

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const $dom = $.create(
    `div.${controllerBottom}`,
    {},
    `<div>
      ${
        !isMobile
          ? `<button aria-label="Play" class="${icon}" type="button">
              ${playSvg}
              ${pauseSvg}
            </button>`
          : ''
      }

      <span class=${time}>00:00 / --:--</span>
    </div>

    <!-- right -->
    <div>
      <div class="${dropdown} ${dropdownHoverable}">
        <button class=${icon} type="button" aria-label="Speed">
          ${player.playbackRate == 1 ? player.locales.get('SPD') : `${player.playbackRate}x`}
        </button>
        <div class=${expand}>
          ${config.speed
            ?.map(
              (sp) =>
                `<span
                  class=${dropItem}
                  aria-label="Speed"
                  data-value=${sp}
                  data-selected=${String(+sp == player.playbackRate)}
                >
                  ${sp}<small>x</small>
                </span>`
            )
            .join('')}
        </div>
      </div>

      ${
        config.screenshot
          ? `<button aria-label="Screenshot" class="${icon}" type="button">
              ${screenshotSvg}
            </button>`
          : ''
      }

      <div class="${dropdown} ${dropdownHoverable}">
        <button class=${icon} type="button" aria-label="Volume">
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
        config.fullscreen && player.isFullscreenEnabled
          ? `<div class="${dropdown} ${dropdownHoverable}">
              <button aria-label="Fullscreen" class="${icon}" type="button">
                ${expandSvg}
                ${compressSvg}
              </button>

              ${
                config.fullscreenWeb
                  ? `<div class=${expand}>
                      <button aria-label="WebFullscreen" class="${icon}" type="button"  >
                        ${webExpandSvg}
                        ${webCompressSvg}
                      </button>
                    </div>`
                  : ''
              }
            </div>`
          : config.fullscreenWeb
          ? `<button aria-label="WebFullscreen" class="${icon}" type="button">
              ${webExpandSvg}
              ${webCompressSvg}
            </button>`
          : ''
      }
    </div>`
  )

  const $volume = $dom.querySelector<HTMLButtonElement>('button[aria-label="Volume"]')!
  renderVolumeBar(player, $volume.nextElementSibling! as HTMLDivElement)

  const $play = $dom.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!
  const $fullscreen = $dom.querySelector<HTMLButtonElement>('button[aria-label="Fullscreen"]')!
  const $webFull = $dom.querySelector<HTMLButtonElement>('button[aria-label="WebFullscreen"]')!
  const $speedText = $dom.querySelector<HTMLButtonElement>('button[aria-label="Speed"]')!
  const $time = $dom.querySelector<HTMLSpanElement>('.' + time)!

  const switcher = (el: HTMLCollection, key: 0 | 1) => {
    el[key]!.removeAttribute('style')
    ;(el.item(key == 1 ? 0 : 1) as HTMLDivElement).style.display = 'none'
  }

  const playerSwitcher = () => {
    !isMobile && switcher($play.children, player.isPlaying ? 1 : 0)
  }

  const volumeSwitcher = () => {
    switcher($volume.children, player.isMuted || player.volume == 0 ? 1 : 0)
  }

  const toggleWebFullIcon = () => {
    if (!$webFull) return
    if (player.isFullScreen) {
      $webFull.style.display = 'none'
    } else {
      $webFull.removeAttribute('style')
    }
  }

  const fullscreenSwitcher = () => {
    switcher($fullscreen.children, (toggleWebFullIcon(), player.isFullScreen ? 1 : 0))
  }

  const webFullscreenSwitcher = (isWebFullScreen: boolean) => {
    switcher($webFull.children, isWebFullScreen ? 1 : 0)
  }

  playerSwitcher(), volumeSwitcher()

  if (player.isFullscreenEnabled && config.fullscreen) {
    fullscreenSwitcher()
    player.on('fullscreenchange', () => setTimeout(fullscreenSwitcher))
  }

  if (config.fullscreenWeb) {
    webFullscreenSwitcher(false)
    player.on('webfullscreen', () =>
      webFullscreenSwitcher(toggleClass(player.$root, webFullScreen))
    )
  }

  !isMobile && player.on(['play', 'pause'], playerSwitcher)
  player.on('volumechange', volumeSwitcher)
  player.on(['durationchange', 'timeupdate'], () => {
    $time.innerText = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
  })
  player.on('videosourcechange', () => {
    $time.innerText = '00:00 / --:--'
    playerSwitcher()
  })

  player.on('ratechange', () => {
    const rate = player.playbackRate
    $speedText.innerText = rate + 'x'
    const index = config.speed?.findIndex((sp) => +sp == rate) ?? -1
    if (index != -1) {
      const target = $dom.querySelectorAll<HTMLSpanElement>('span[aria-label="Speed"]')[index]!
      target.setAttribute('data-selected', 'true')
      siblings(target, (t) => t.setAttribute('data-selected', 'false'))
    }
  })

  let preVolume = player.volume

  $dom.addEventListener('click', (e: Event) => {
    const target = e.target! as HTMLDivElement
    const label = target.getAttribute('aria-label')

    switch (label) {
      case 'Play':
        return player.togglePlay()
      case 'Speed': {
        if (target.hasAttribute('data-value'))
          player.setPlaybackRate(+target.getAttribute('data-value')!)
        break
      }
      case 'Volume':
        if (isMobile) return
        if (player.isMuted) {
          player.unmute()
          player.setVolume(preVolume)
        } else {
          preVolume = player.volume
          player.mute()
        }
        break
      case 'Picture in Picture':
        return player.togglePip()
      case 'Fullscreen':
        return player.toggleFullScreen()
      case 'WebFullscreen':
        player.emit('webfullscreen')
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
