import { render, html } from 'lit'
import { ref } from 'lit/directives/ref.js'
import type { PlayerPlugin } from '@oplayer/core'
import Player, { formatTime } from '@oplayer/core'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'

import playSvg from './icons/play.svg?raw'
import pauseSvg from './icons/pause.svg?raw'
import expandSvg from './icons/expand.svg?raw'
import compressSvg from './icons/compress.svg?raw'

import './index.css'

let $controller: HTMLDivElement

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

  const vn = ({ playedWidth = 0, bufferedWidth = 0 } = {}) => html`
    <div class="oh-controller" ${ref((el) => ($controller = el as HTMLDivElement))}>
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
          <button
            aria-label="Play"
            class="play icon"
            type="button" @click=${() => player.togglePlay()}
          >
            ${unsafeSVG(player.isPlaying ? pauseSvg : playSvg)}
          </button>
          <span class="time">
            ${formatTime(player.currentTime)} / ${formatTime(player.duration)}
          </time>

          </div>
        <div class="oh-controller-br">
            <button
              aria-label="Fullscreen"
              class="expand icon"
              type="button"
              @click=${() => player.toggleFullScreen()}
            >
              ${unsafeSVG(player.isFullScreen ? compressSvg : expandSvg)}
          </button>
        </div>
      </div>
    </div>`

  render(vn(), player.$root)

  player.__video.addEventListener('click', () => {
    player.togglePlay()
  })

  const ui = () => render(vn({ ...calculateWidth(player) }), player.$root)

  player.on(['timeupdate', 'play', 'pause'], ui)
  player.on('seeking', ui)

  const debounceHideCtrl = debounce(() => {
    player.isPlaying && $controller.classList.add('hide')
  })

  player.on('play', () => {
    debounceHideCtrl()
  })

  player.on('pause', () => {
    $controller.classList.remove('hide')
  })

  player.on('mousemove', () => {
    $controller.classList.contains('hide') && $controller.classList.remove('hide')
    debounceHideCtrl()
  })
}

const ui: PlayerPlugin = {
  name: 'oh-ui',
  apply
}

const debounce = (fn: () => void, ms: number = 1000) => {
  let time: NodeJS.Timeout | null = null
  return () => {
    time && clearTimeout(time)
    time = setTimeout(() => {
      fn()
    }, ms)
  }
}

export default ui
