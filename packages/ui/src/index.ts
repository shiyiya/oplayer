import type { PlayerPlugin } from '@oplayer/core'
import Player, { formatTime, isMobile } from '@oplayer/core'
import { html, render } from 'lit'
import { ref } from 'lit/directives/ref.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'

import compressSvg from './icons/compress.svg?raw'
import expandSvg from './icons/expand.svg?raw'
import pauseSvg from './icons/pause.svg?raw'
import pipSvg from './icons/pip.svg?raw'
import playSvg from './icons/play.svg?raw'
import volumeOffSvg from './icons/volume-off.svg?raw'
import volumeSvg from './icons/volume.svg?raw'

import './index.css'

let $controller: HTMLDivElement
let controllerIsActive = false
let ctrlAutoHideTimer: NodeJS.Timeout | null = null

let CTRL_HIDE_DELAY = 1200

const calculateWidth = (player: Player) => {
  const { currentTime, duration } = player
  const buffered = player.buffered.length ? player.buffered.end(player.buffered.length - 1) : 0
  const bufferedWidth = (buffered / duration) * 100
  const playedWidth = (currentTime / duration) * 100
  return { bufferedWidth, playedWidth }
}

const apply = (player: Player) => {
  const createHitRef = (el: Element | undefined) => {
    const $hit = el!.querySelector('.oh-controller-progress-hit')! as HTMLDivElement
    el!.addEventListener('mousemove', (e: any) => {
      let hoverWidth = 0
      if (e.target.classList.contains('oh-controller-progress-played-dot')) {
        hoverWidth = (player.currentTime / player.duration) * 100
      } else {
        hoverWidth = (e.offsetX / e.currentTarget!.offsetWidth) * 100
      }
      $hit.innerText = formatTime(player.duration * (hoverWidth / 100))
      $hit.style.left = `${hoverWidth}%`
    })
    el!.addEventListener('mousedown', (e: any) => {
      if (!e.target.classList.contains('oh-controller-progress-played-dot'))
        player.seek(player.duration * (e.offsetX / el!.clientWidth))
    })
  }

  const vn = ({ playedWidth = 0, bufferedWidth = 0 } = {}) => html` <div class="oh-ui">
    <div class="oh-mask" @click=${() => player.togglePlay()}></div>
    <div class="oh-area">
      ${player.isLoading
        ? html`
            <div class="oh-loading">
              <div class="linear-activity">
                <div class="indeterminate"></div>
              </div>
            </div>
          `
        : null}

      <div
        class="oh-play"
        aria-label="Play"
        style="display:${player.isPlaying || !player.isLoaded ? 'none' : 'block'}"
      >
        <button
          aria-label="Play"
          class="play icon"
          type="button"
          @click=${() => player.togglePlay()}
        >
          ${unsafeSVG(player.isPlaying ? pauseSvg : playSvg)}
        </button>
      </div>
    </div>

    <div
      class="oh-controller"
      @mouseenter=${() => (controllerIsActive = true)}
      @mouseleave=${() => (controllerIsActive = false)}
      ${ref((el) => ($controller = el as HTMLDivElement))}
    >
      <div class="oh-controller-progress-wrap" ${ref(createHitRef)}>
        <div class="oh-controller-progress">
          <div class="oh-controller-progress-hit">00:00</div>
          <div class="oh-controller-progress-buffered" style="width:${bufferedWidth}%"></div>
          <div class="oh-controller-progress-played" style="width:${playedWidth}%"></div>
          <div
            class="oh-controller-progress-played-dot"
            style="transform: translateX(${playedWidth}%);"
          ></div>
        </div>
      </div>

      <div class="oh-controller-bottom">
        <div class="oh-controller-bl">
          ${!isMobile
            ? html`<button
                aria-label="Play"
                class="play icon"
                type="button"
                @click=${() => player.togglePlay()}
              >
                ${unsafeSVG(player.isPlaying ? pauseSvg : playSvg)}
              </button>`
            : null}
          <span class="time" style="${isMobile ? 'padding-left: 0' : ''}">
            ${formatTime(player.currentTime)} / ${formatTime(player.duration)}
          </span>
        </div>
        <div class="oh-controller-br">
          <div class="dropdown speed">
            <button
              aria-label="Speed"
              class="icon"
              type="button"
              @click=${() => player.toggleMute()}
            >
              ${player.playbackRate == 1 ? 'SPD' : `${player.playbackRate}x`}
            </button>
            <div class="expand">
              ${['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'].map(
                (sp) =>
                  html`<span class="speed-item" @click=${() => player.setPlaybackRate(+sp)}
                    >${sp}<small>x</small></span
                  >`
              )}
            </div>
          </div>

          <div class="dropdown">
            <button
              aria-label="Volume"
              class="icon volume"
              type="button"
              @click=${() => player.toggleMute()}
            >
              ${unsafeSVG(player.isMuted ? volumeOffSvg : volumeSvg)}
            </button>
          </div>

          ${player.isPipEnabled
            ? html` <button
                aria-label="Picture in Picture"
                class="icon pip"
                type="button"
                @click=${() => player.togglePip()}
              >
                ${unsafeSVG(pipSvg)}
              </button>`
            : null}

          <button
            aria-label="Fullscreen"
            class="icon"
            type="button"
            @click=${() => player.toggleFullScreen()}
          >
            ${unsafeSVG(player.isFullScreen ? compressSvg : expandSvg)}
          </button>
        </div>
      </div>
    </div>
  </div>`

  render(vn(), player.$root)

  const ui = () => render(vn({ ...calculateWidth(player) }), player.$root)

  player.on(['timeupdate', 'play', 'pause', 'volumechange', 'ratechange', 'canplay'], ui)
  player.on('seeking', ui)

  const hideCtrl = () => {
    !controllerIsActive && $controller.classList.add('hide')
  }
  const debounceHideCtrl = debounce(hideCtrl)
  const autoHideCtrl = () => {
    setTimeout(() => {
      $controller.classList.add('hide')
    }, CTRL_HIDE_DELAY)
  }
  const showCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    $controller.classList.remove('hide')
  }

  player.on('play', () => {
    autoHideCtrl()
  })

  player.on('pause', () => {
    if (isMobile) {
      showCtrl()
    } else {
      hideCtrl()
    }
  })

  if (!isMobile) {
    player.on('mousemove', () => {
      showCtrl()
      debounceHideCtrl()
    })
    player.on('mouseleave', hideCtrl)
  }
}

const ui = (): PlayerPlugin => ({
  name: 'oplayer-theme-snow',
  apply
})

const debounce = (fn: () => void, ms: number = CTRL_HIDE_DELAY) => {
  let time: NodeJS.Timeout | null = null
  return () => {
    time && clearTimeout(time)
    time = setTimeout(() => {
      fn()
    }, ms)
  }
}

export default ui