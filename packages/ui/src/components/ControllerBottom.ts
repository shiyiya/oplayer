import { $ } from '@oplayer/core'
import { icon, webFullScreen } from '../style'
import { formatTime, isMobile, screenShot, siblings } from '../utils'
import renderVolumeBar from './VolumeBar'

import type Player from '@oplayer/core'
import type { SnowConfig } from '../types'

import expandSvg from '../icons/fullscreen-enter.svg?raw'
import compressSvg from '../icons/fullscreen-exit.svg?raw'
import pauseSvg from '../icons/pause.svg?raw'
import pipSvg from '../icons/pip.svg?raw'
import playSvg from '../icons/play.svg?raw'
import screenshotSvg from '../icons/screenshot.svg?raw'
import volumeOffSvg from '../icons/sound-off.svg?raw'
import volumeSvg from '../icons/sound-on.svg?raw'
import subtitleSvg from '../icons/subtitle.svg?raw'
import webExpandSvg from '../icons/web-fullscreen.svg?raw'

const ohcontrollertime = $.css`
  display: flex;
  align-items: center;
  padding: 0px 0.5em;
  min-width: 100px;
  font-size: 0.875em;
  color: rgba(255, 255, 255, 0.9);
  box-sizing: content-box;
  font-variant-numeric: tabular-nums;
`

const expand = $.css(`
    position: absolute;
    top: 0;
    right: 0px;
    z-index: 10;
    transform: translate(0%, -100%);
    box-sizing: border-box;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.9);
    color: #fffc;
    font-size: 12px;
    visibility: hidden;
    transition: opacity 0.1s ease-in-out;
    padding: 4px;
`)

const dropdown = $.css({
  position: 'relative',
  'line-height': '100%',

  [`&:hover .${expand}`]: {
    visibility: 'visible'
  }
})

const dropitem = $.css({
  'font-size': '14px',
  display: 'block',
  padding: '6px 15px',
  'text-align': 'center',
  cursor: 'pointer',
  'border-radius': '4px',
  'margin-bottom': '2px',

  '&:nth-last-child(1)': {
    'margin-bottom': '0px'
  },

  '& *': {
    'pointer-events': 'none'
  },

  '&[data-selected="true"]': {
    'font-weight': 'bold',
    color: 'var(--primary-color)'
  },

  '&[data-selected="true"],&:hover': {
    'background-color': '#ffffff1a'
  }
})

const render = (player: Player, el: HTMLElement, config: SnowConfig) => {
  const $dom = $.create(
    `div.${$.css({
      display: 'flex',
      'justify-content': 'space-between',
      'font-size': '14px',
      color: 'hsla(0,0%,100%,.8)',
      fill: 'hsla(0,0%,100%,.9)',
      height: '30px',
      padding: '5px 0px',
      'line-height': '22px',
      'text-align': 'center',

      ['@media only screen and (max-width: 991px)']: {
        '&': {
          padding: '0px'
        }
      },

      [`& .${icon}[data-value='false']`]: {
        opacity: 0.6
      },

      [`& .${icon}`]: {
        width: '36px',
        height: '22px',

        ['> svg']: {
          width: '100%',
          height: '100%',
          'pointer-events': 'none'
        }
      },

      '> div': {
        display: 'flex',
        'align-items': 'center',

        '> div:hover, > button:hover': {
          color: '#fff',
          fill: '#fff'
        }
      }
    })}`,
    {},
    `<div>
          ${
            !isMobile
              ? `<button
                  aria-label="Play"
                  class="${icon}"
                  type="button"
                >
                  ${playSvg}
                  ${pauseSvg}
                </button>`
              : ''
          }

          <span class=${ohcontrollertime} style="${isMobile ? 'padding-left: 0' : ''}">
            00:00 / --:--
          </span>
        </div>

        <div>
          <div class=${dropdown}>
            <button class="${icon}"  type="button">${
      player.playbackRate == 1 ? 'SPD' : `${player.playbackRate}x`
    }</button>
            <div class=${expand}>
              ${config.speed
                ?.map(
                  (sp) =>
                    `<span
                    class=${dropitem}
                    aria-label="Speed"
                    data-value=${sp}>
                      ${sp}<small>x</small>
                    </span>`
                )
                .join('')}
            </div>
          </div>

         ${
           config.screenshot
             ? `<button
                  aria-label="screenshot"
                  class="${icon}"
                  type="button"
                >
                  ${screenshotSvg}
                </button>`
             : ''
         }

          ${
            config.subtitle
              ? `
              <div class=${dropdown}>
                <button
                  aria-label="subtitle"
                  data-value="${true}"
                  class="${icon}"
                  type="button"
                >
                  ${subtitleSvg}
                </button>
                <div class=${expand}>
                  ${config.subtitle
                    ?.map(
                      (s, i) => `
                      <span
                        class=${dropitem}
                        aria-label="subtitle"
                        data-value=${i}
                        data-selected=${s.default ? 'true' : 'false'}
                      >
                        ${s.name || 'default'}
                      </span>`
                    )
                    .join('')}
                </div>
              </div>`
              : ''
          }

          <div class=${dropdown}>
            <button aria-label="Volume" class="${icon}" type="button">
              ${volumeSvg}
              ${volumeOffSvg}
            </button>
            <div class=${expand}></div>
          </div>

          ${
            config.pictureInPicture && player.isPipEnabled
              ? `<button
                  aria-label="Picture in Picture"
                  class="${icon}"
                  type="button"
                >
                  ${pipSvg}
                </button>`
              : ''
          }

          ${
            config.fullscreen
              ? `
            <div class=${dropdown}>
              <button
                  aria-label="Fullscreen"
                  class="${icon}"
                  type="button"
              >
                ${expandSvg}
                ${compressSvg}
              </button>

              ${
                config.fullscreenWeb
                  ? `
                  <div class=${expand}>
                    <button
                      aria-label="WebFullscreen"
                      class="${icon}"
                      type="button"
                    >
                    ${webExpandSvg}
                    </button>
                  </div>`
                  : ''
              }

            </div>`
              : ''
          }
        </div>`
  )

  player.on(['durationchange', 'timeupdate', 'videosourcechange'], () => {
    $dom.querySelector<HTMLSpanElement>('.' + ohcontrollertime)!.innerText =
      // prettire-ignore
      `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
  })

  const $play = $dom.querySelector<HTMLButtonElement>('button[aria-label="Play"]')!
  const $volume = $dom.querySelector<HTMLButtonElement>('button[aria-label="Volume"]')!
  const $volumeSlider = $dom.querySelector('button[aria-label="Volume"]')!
    .nextElementSibling! as HTMLDivElement
  const $fullscreen = $dom.querySelector<HTMLButtonElement>('button[aria-label="Fullscreen"]')!

  renderVolumeBar(player, $volumeSlider)

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

  const fullscreenSwitcher = () => {
    switcher($fullscreen.children, player.isFullScreen ? 1 : 0)
  }

  playerSwitcher(), volumeSwitcher(), fullscreenSwitcher()
  player.on(['play', 'pause', 'videosourcechange'], playerSwitcher)
  player.on('volumechange', volumeSwitcher)
  player.on('fullscreenchange', () => setTimeout(fullscreenSwitcher))
  player.on('webfullscreen', () => {
    player.$root.classList.toggle(webFullScreen)
  })

  let preVolumn = player.volume

  $dom.addEventListener('click', (e) => {
    const key = (e.target! as HTMLDivElement).getAttribute('aria-label')
    switch (key) {
      case 'Play':
        return player.togglePlay()
      case 'Speed': {
        const target = e.target! as HTMLDivElement
        const speed = target.getAttribute('data-value')!
        target.setAttribute('data-selected', 'true')
        siblings(target, (t) => t.setAttribute('data-selected', 'false'))
        target.parentElement!.previousElementSibling!.textContent = speed + 'x'
        player.setPlaybackRate(+speed)
        break
      }
      case 'Volume':
        if (player.isMuted) {
          player.unmute()
          player.setVolume(preVolumn)
        } else {
          preVolumn = player.volume
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
      case 'screenshot':
        screenShot(player)
        break
      case 'subtitle':
        {
          const target = e.target! as HTMLDivElement
          const state = target.getAttribute('data-value')!
          if (isNaN(+state)) {
            target.setAttribute('data-value', state == 'true' ? 'false' : 'true')
            player.emit(state ? 'hiddensubtitle' : 'showsubtitle')
          } else {
            target.setAttribute('data-selected', 'true')
            siblings(target, (t) => t.setAttribute('data-selected', 'false'))
            player.emit('subtitlechange', config.subtitle![+target.getAttribute('data-value')!])
          }
        }
        break
      default:
        break
    }
  })

  $.render($dom, el)
}

export default render
