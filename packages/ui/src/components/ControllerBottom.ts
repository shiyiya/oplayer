import { $, isMobile, formatTime } from '@oplayer/core'
import { icon } from '../style'
import type Player from '@oplayer/core'
import renderVolumeBar from './VolumeBar'
import type { SnowConfig } from '../types'

import compressSvg from '../icons/compress.svg'
import expandSvg from '../icons/expand.svg'
import pauseSvg from '../icons/pause.svg'
import pipSvg from '../icons/pip.svg'
import playSvg from '../icons/play.svg'
import volumeOffSvg from '../icons/volume-off.svg'
import volumeSvg from '../icons/volume.svg'

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
    transform: translate(0%, -100%);
    box-sizing: border-box;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.9);
    color: #fff;
    font-size: 12px;
    visibility: hidden;
    transition: opacity 0.1s ease-in-out;
`)

const dropdown = $.css({
  position: 'relative',

  [`&:hover .${expand}`]: {
    visibility: 'visible'
  }
})

const speeditem = $.css`
  font-size: 14px;
  display: block;
  padding: 6px 15px;
  text-align: center;
  cursor: pointer;
`

const render = (player: Player, el: HTMLElement, config: SnowConfig) => {
  const $dom = $.create(
    `div.${$.css({
      display: 'flex',
      'justify-content': 'space-between',

      '> div': {
        display: 'flex',
        'align-items': 'center'
      },

      '& button': {
        '& > svg': {
          'pointer-events': 'none',
          width: '1.3em',
          height: '1.3em',
          fill: 'currentcolor'
        },

        '&.pip': {
          transform: 'scale(1.12)',
          'margin-right': '1px'
        },

        '&.volume': {
          transform: 'scale(1.12)'
        }
      }
    })}`,
    {},
    `<div>
          ${
            !isMobile
              ? `<button
                  aria-label="Play"
                  class="${icon} play"
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
            <button class="${icon}"  type="button">
              ${player.playbackRate == 1 ? 'SPD' : `${player.playbackRate}x`}
            </button>
            <div class=${expand}>
              ${config.speed
                ?.map(
                  (sp) =>
                    `<span
                    class=${speeditem}
                    aria-label="Speed"
                    data-value=${sp}>
                      ${sp}<small>x</small>
                    </span>`
                )
                .join('')}
            </div>
          </div>

          <div class=${dropdown}>
            <button aria-label="Volume" class="${icon} volume" type="button">
              ${volumeSvg}
              ${volumeOffSvg}
            </button>
            <div class=${expand}>
            </div>
          </div>

          ${
            !config.disablePictureInPicture && player.isPipEnabled
              ? `<button
                  aria-label="Picture in Picture"
                  class="${icon} pip"
                  type="button"
                >
                  ${pipSvg}
                </button>`
              : ''
          }
          ${
            !config.disableFullscreen
              ? `<button
                  aria-label="Fullscreen"
                  class="${icon} fullscreen"
                  type="button"
                >
                  ${expandSvg}
                  ${compressSvg}
                </button>`
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

  const switcher = (el: HTMLCollection, key: number) => {
    el[key]!.removeAttribute('style')

    Array(el.length)
      .fill(1)
      .forEach((_, i) => {
        i !== key && el.item(i) && ((el.item(i) as HTMLDivElement).style.display = 'none')
      })
  }

  const playerSwitcher = () => {
    !isMobile && switcher($play.children, player.isPlaying ? 1 : 0)
  }

  const volumeSwitcher = () => {
    switcher($volume.children, player.isMuted ? 1 : 0)
  }

  const fullscreenSwitcher = () => {
    switcher($fullscreen.children, player.isFullScreen ? 1 : 0)
  }

  playerSwitcher(), volumeSwitcher(), fullscreenSwitcher()
  player.on(['play', 'pause'], playerSwitcher)
  player.on('volumechange', volumeSwitcher)
  player.on('fullscreenchange', () => setTimeout(fullscreenSwitcher))

  let preVolumn = player.volume

  $dom.addEventListener('click', (e) => {
    const key = (e.target! as HTMLDivElement).getAttribute('aria-label')
    switch (key) {
      case 'Play':
        player.togglePlay()
        break
      case 'Speed': {
        const target = e.target! as HTMLDivElement
        const speed = target.getAttribute('data-value')!
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
        player.togglePip()
        break
      case 'Fullscreen':
        player.toggleFullScreen()
        break
      default:
        break
    }
  })

  $.render($dom, el)
}

export default render
