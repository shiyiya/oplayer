import { $, formatTime } from '@oplayer/core'
import type Player from '@oplayer/core'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css({
      transition: 'width 0.3s ease',
      'box-sizing': 'border-box',
      padding: '5px 0',
      cursor: 'pointer',
      width: '100%',

      '&:hover .oh-controller-progress-played-dot::before': {
        transform: 'scale(1)'
      },

      '&:hover .oh-controller-progress-hit': {
        opacity: 1
      }
    })}`,
    {},
    `<div class=${$.css({
      position: 'relative',
      height: '4px',
      width: '100%',
      background: 'hsla(0, 0%, 100%, 0.2)',
      cursor: 'pointer',
      'border-radius': '2px',

      '& .oh-controller-progress-buffered,& .oh-controller-progress-played': {
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        height: '4px',
        'will-change': 'width',
        transition: 'all 0.2s ease',
        'border-radius': '2px',
        'pointer-events': 'none'
      },

      '& > .oh-controller-progress-buffered': {
        background: 'hsla(0, 0%, 100%, 0.4)'
      },

      '& > .oh-controller-progress-played': {
        background: 'var(--primary-color)'
      },

      '& .oh-controller-progress-played-dot': {
        transition: 'transform 0.2s ease',
        width: '100%',
        'pointer-events': 'none'
      },

      '& .oh-controller-progress-played-dot::before': {
        'margin-left': '-6px',
        transition: 'transform 0.3s ease',
        transform: 'scale(0)',
        content: "''",
        display: 'block',
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        height: '0.8em',
        width: '0.8em',
        background: '#fff',
        'margin-top': '-4.5px',
        'z-index': '1',
        'border-radius': '50%',
        'will-change': 'left'
      },

      '& .oh-controller-progress-hit': {
        position: 'absolute',
        left: '0',
        'border-radius': '4px',
        padding: '5px 7px',
        'background-color': 'rgba(0, 0, 0, 0.62)',
        color: '#fff',
        'font-size': '12px',
        'text-align': 'center',
        transition: 'opacity 0.1s ease-in-out',
        'word-wrap': 'normal',
        'word-break': 'normal',
        'z-index': '2',
        'pointer-events': 'none',
        transform: 'translateX(-50%)',
        opacity: '0',
        bottom: '10px'
      }
    })}>
      <div class="oh-controller-progress-hit">00:00</div>
      <div class="oh-controller-progress-buffered" style="width:0%"></div>
      <div class="oh-controller-progress-played" style="width:0%"></div>
      <div class="oh-controller-progress-played-dot"style="transform: translateX(0%);"></div>
  </div>`
  )

  const $hit = $dom.querySelector<HTMLDivElement>('.oh-controller-progress-hit')!
  const $buffered = $dom.querySelector<HTMLDivElement>('.oh-controller-progress-buffered')!
  const $played = $dom.querySelector<HTMLDivElement>('.oh-controller-progress-played')!
  const $playedDto = $dom.querySelector<HTMLDivElement>('.oh-controller-progress-played-dot')!

  $dom.addEventListener(
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

  $dom.addEventListener(
    'mousedown',
    (e: MouseEvent) => {
      const target = <HTMLDivElement>e.target
      const rect = target.getBoundingClientRect()
      if (!(<HTMLDivElement>e.target!).classList.contains('oh-controller-progress-played-dot')) {
        player.seek((player.duration * (e.clientX - rect.x)) / rect.width)
      }
    },
    { passive: true }
  )

  player.on('timeupdate', () => {
    const { currentTime, duration } = player
    const buffered = player.buffered.length ? player.buffered.end(player.buffered.length - 1) : 0
    const bufferedWidth = (buffered / duration) * 100
    const playedWidth = (currentTime / duration) * 100
    $buffered.style.width = bufferedWidth + '%'
    $played.style.width = playedWidth + '%'
    $playedDto.style.transform = `translateX(${playedWidth}%)`
  })

  $.render($dom, el)
}

export default render
