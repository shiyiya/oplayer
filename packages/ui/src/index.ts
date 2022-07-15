import type { PlayerPlugin, PlayerEvent } from '@oplayer/core'
import Player, { formatTime, isMobile, $ } from '@oplayer/core'
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

import styles from './index.style'
import loadingStyles from './loading.style'

import renderLoding from './components/Loading'
import renderMask from './components/Mask'
import renderButton from './components/CoverButton'

let CTRL_HIDE_DELAY = 1500

let $controller: HTMLDivElement
let controllerIsActive = false
let ctrlAutoHideTimer: NodeJS.Timeout | null = null
let err: PlayerEvent | null = null

const debounce = (fn: () => void, ms: number = CTRL_HIDE_DELAY) => {
  let time: NodeJS.Timeout | null = null
  return () => {
    time && clearTimeout(time)
    time = setTimeout(() => {
      fn()
    }, ms)
  }
}

const hideCtrl = () => {
  !controllerIsActive && $controller.classList.add('hide')
}

const debounceHideCtrl = debounce(hideCtrl)
const autoHideCtrl = () => {
  ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
  ctrlAutoHideTimer = setTimeout(() => {
    $controller.classList.add('hide')
  }, CTRL_HIDE_DELAY)
}
const showCtrl = () => {
  ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
  $controller.classList.remove('hide')
}

const calculateWidth = (player: Player) => {
  const { currentTime, duration } = player
  const buffered = player.buffered.length ? player.buffered.end(player.buffered.length - 1) : 0
  const bufferedWidth = (buffered / duration) * 100
  const playedWidth = (currentTime / duration) * 100
  return { bufferedWidth, playedWidth }
}

const apply2 = (player: Player, config: SnowConfig) => {
  const $dom = $.create(`<div class=${styles.ohui(config.theme)}></div>`)
  const $area = $.create(`<div. class=${$.css`width: 100%;height: 100%;`}></div>`)

  // error

  // area
  $.render($area, $dom)
  renderLoding(player, $area)
  renderMask(player, $area)
  renderButton(player, $area)

  // root
  $.render($dom, player.$root)
}

const apply = (player: Player, config: SnowConfig) => {
  const createHitRef = (el: Element | undefined) => {
    const $hit = el!.querySelector('.oh-controller-progress-hit')! as HTMLDivElement
    el!.addEventListener(
      'mousemove',
      (e: any) => {
        let hoverWidth = 0
        if (e.target.classList.contains('oh-controller-progress-played-dot')) {
          hoverWidth = (player.currentTime / player.duration) * 100
        } else {
          hoverWidth = (e.offsetX / e.currentTarget!.offsetWidth) * 100
        }
        $hit.innerText = formatTime(player.duration * (hoverWidth / 100))
        $hit.style.left = `${hoverWidth}%`
      },
      { passive: true }
    )
    el!.addEventListener(
      'mousedown',
      (e: any) => {
        if (!e.target.classList.contains('oh-controller-progress-played-dot'))
          player.seek(player.duration * (e.offsetX / el!.clientWidth))
      },
      { passive: true }
    )
  }

  const vn = ({ playedWidth = 0, bufferedWidth = 0 } = {}) => html` <div
    class=${styles.ohui(config.theme)}
  >
    <div class=${styles.oherror}></div>

    <div class=${styles.oharea}>
      ${player.isLoading
        ? html`
            <div class=${styles.ohloading}>
              <div class=${loadingStyles}>
                <div class="indeterminate"></div>
              </div>
            </div>
          `
        : null}

      <div class=${styles.ohmask} @click=${() => player.togglePlay()}></div>

      <div
        class=${styles.ohplay}
        aria-label="Play"
        style="display:${player.isPlaying || player.isLoading ? 'none' : 'block'}"
      >
        <button
          aria-label="Play"
          class="oh-icon play"
          type="button"
          @click=${() => player.togglePlay()}
        >
          ${unsafeSVG(player.isPlaying ? pauseSvg : playSvg)}
        </button>
      </div>
    </div>

    <div
      class=${styles.ohcontroller}
      @mouseenter=${() => (controllerIsActive = true)}
      @mouseleave=${() => (controllerIsActive = false)}
      ${ref((el) => ($controller = el as HTMLDivElement))}
    >
      <div class=${styles.ohcontrollerwrap} ${ref(createHitRef)}>
        <div class=${styles.ohcontrollerprogress}>
          <div class="oh-controller-progress-hit">00:00</div>
          <div class="oh-controller-progress-buffered" style="width:${bufferedWidth}%"></div>
          <div class="oh-controller-progress-played" style="width:${playedWidth}%"></div>
          <div
            class="oh-controller-progress-played-dot"
            style="transform: translateX(${playedWidth}%);"
          ></div>
        </div>
      </div>

      <div class=${styles.ohcontrollerbottom}>
        <div>
          ${!isMobile
            ? html`<button
                aria-label="Play"
                class="oh-icon play"
                type="button"
                @click=${() => player.togglePlay()}
              >
                ${unsafeSVG(player.isPlaying ? pauseSvg : playSvg)}
              </button>`
            : null}

          <span class=${styles.ohcontrollertime} style="${isMobile ? 'padding-left: 0' : ''}">
            ${formatTime(player.currentTime)} / ${formatTime(player.duration)}
          </span>
        </div>

        <div>
          <div class=${styles.dropdown}>
            <button aria-label="Speed" class="oh-icon" type="button">
              ${player.playbackRate == 1 ? 'SPD' : `${player.playbackRate}x`}
            </button>
            <div class="expand">
              ${config.speed?.map(
                (sp) =>
                  html`<span class=${styles.speeditem} @click=${() => player.setPlaybackRate(+sp)}
                    >${sp}<small>x</small></span
                  >`
              )}
            </div>
          </div>

          <div class=${styles.dropdown}>
            <button
              aria-label="Volume"
              class="oh-icon volume"
              type="button"
              @click=${() => player.toggleMute()}
            >
              ${unsafeSVG(player.isMuted ? volumeOffSvg : volumeSvg)}
            </button>
          </div>

          ${!config.disablePictureInPicture && player.isPipEnabled
            ? html` <button
                aria-label="Picture in Picture"
                class="oh-icon pip"
                type="button"
                @click=${() => player.togglePip()}
              >
                ${unsafeSVG(pipSvg)}
              </button>`
            : null}
          ${!config.disableFullscreen
            ? html` <button
                aria-label="Fullscreen"
                class="oh-icon fullscreen"
                type="button"
                @click=${() => player.toggleFullScreen()}
              >
                ${unsafeSVG(player.isFullScreen ? compressSvg : expandSvg)}
              </button>`
            : null}
        </div>
      </div>
    </div>
  </div>`

  render(vn(), player.$root)

  const ui = () => render(vn({ ...calculateWidth(player) }), player.$root)

  player.on(
    [
      'timeupdate',
      'play',
      'pause',
      'volumechange',
      'ratechange',
      'canplay',
      'durationchange',
      'seeking',
      'play',
      'waiting',
      'pause',
      'videosourcechange'
    ],
    ui
  )

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

  player.on('videosourcechange', () => {
    showCtrl()
    autoHideCtrl()
  })

  if (!isMobile) {
    player.on('mousemove', () => {
      showCtrl()
      debounceHideCtrl()
    })
    player.on('mouseleave', hideCtrl)
  }
}

export type SnowConfig = {
  theme?: {
    primaryColor: `#${string}`
  }
  speed?: string[]
  disableFullscreen?: boolean
  disablePictureInPicture?: boolean
}

const defaultConfig: SnowConfig = {
  theme: {
    primaryColor: '#6668ab'
  },
  speed: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'],
  disableFullscreen: false,
  disablePictureInPicture: false
}

const snow = (config?: SnowConfig): PlayerPlugin => ({
  name: 'oplayer-theme-snow',
  apply: (player) => apply(player, Object.assign(defaultConfig, config))
})

export default snow
