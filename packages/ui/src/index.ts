import Player, { formatTime } from '@oplayer/core'
import type { PlayerPlugin } from '@oplayer/core'
import style from './index.css'
import { render, html } from 'lit'
import { ref } from 'lit/directives/ref.js'
// import play from './icons/play.svg?raw'

let hoverWidth: number = 0
let $hit: HTMLDivElement
let $controller: HTMLDivElement

const createHitRef = (el: Element | undefined) => {
  $hit = el as HTMLDivElement
  $hit.addEventListener('mousemove', (e: any) => {
    hoverWidth = (e.offsetX / e.currentTarget?.offsetWidth) * 100
  })
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

const calculateWidth = (player: Player) => {
  const { currentTime, duration } = player
  const buffered = player.buffered.length ? player.buffered.end(player.buffered.length - 1) : 0
  const bufferedWidth = (buffered / duration) * 100
  const playedWidth = (currentTime / duration) * 100
  return { bufferedWidth, playedWidth }
}

const apply = (player: Player) => {
  const vn = ({ playedWidth = 0, bufferedWidth = 0, hoverWidth = 0 } = {}) => html` <style>
      ${style}
    </style>
    <div class="oh-mask" @click=${() => player.togglePlay()}></div>
    <div class="oh-controller" ${ref((el) => ($controller = el as HTMLDivElement))}>
      <div
        class="oh-controller-progress-wrap"
        ${ref(createHitRef)}
        @mousedown=${(e: any) => {
          player.seek(player.duration * (e.offsetX / e.currentTarget?.offsetWidth))
        }}
        @mousemove=${(e: any) => {
          hoverWidth = (e.offsetX / e.currentTarget!.offsetWidth) * 100
          render(vn({ playedWidth, bufferedWidth, hoverWidth: hoverWidth }), player.$root)
        }}
      >
        <div class="oh-controller-progress">
          <div class="oh-controller-progress-hit" style="left: ${hoverWidth}%;">
            ${formatTime(player.duration * (hoverWidth / 100))}
          </div>
          <div class="oh-controller-progress-buffered" style="width:${bufferedWidth}%"></div>
          <div class="oh-controller-progress-played" style="width:${playedWidth}%"></div>
          <div
            class="oh-controller-progress-played-dot"
            style="transform: translateX(${playedWidth}%);"
          ></div>
        </div>
      </div>

      <div class="oh-controller-bottom"></div>
    </div>`

  render(vn(), player.$root)

  player.__video.addEventListener('click', () => {
    player.togglePlay()
  })

  player.on('timeupdate', () => {
    render(vn({ hoverWidth, ...calculateWidth(player) }), player.$root)
  })

  const updateProgress = () => {
    render(vn({ hoverWidth, ...calculateWidth(player) }), player.$root)
  }

  const debounceHideCtrl = debounce(() => {
    $controller.classList.add('hide')
  })

  player.on('seeking', updateProgress).on('mouseenter', updateProgress)

  player.on('mousemove', () => {
    $controller.classList.contains('hide') && $controller.classList.remove('hide')
    debounceHideCtrl()
  })
}

const ui: PlayerPlugin = {
  name: 'ui-controller',
  apply
}

export default ui
