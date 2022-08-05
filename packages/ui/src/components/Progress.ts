import type Player from '@oplayer/core'
import { $ } from '@oplayer/core'
import { formatTime } from '../utils'
import { buffered, dot, hit, played, progress, progressInner } from './Progress.style'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${progress}`,
    {},
    `<div class=${progressInner}>
      <div class="${hit}">00:00</div>
      <div class="${buffered}" style="width:0%"></div>
      <div class="${played}" style="width:0%"></div>
      <div class="${dot}" style="transform: translateX(0%);"></div>
  </div>`
  )

  const $hit = $dom.querySelector<HTMLDivElement>(`.${hit}`)!
  const $buffered = $dom.querySelector<HTMLDivElement>(`.${buffered}`)!
  const $played = $dom.querySelector<HTMLDivElement>(`.${played}`)!
  const $playedDto = $dom.querySelector<HTMLDivElement>(`.${dot}`)!

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
      if (!player.isLoaded) return
      const target = <HTMLDivElement>e.target
      const rect = target.getBoundingClientRect()
      if (!(<HTMLDivElement>e.target!).classList.contains('oh-controller-progress-played-dot')) {
        player.seek((player.duration * (e.clientX - rect.x)) / rect.width)
      }
    },
    { passive: true }
  )

  player.on(['timeupdate', 'seeking'], () => {
    const { currentTime, duration } = player
    const playedWidth = (currentTime / duration) * 100 || 0
    $played.style.width = playedWidth + '%'
    $playedDto.style.transform = `translateX(${playedWidth}%)`
  })

  player.on(['progress'], () => {
    const buffered = player.buffered.length
      ? (player.buffered.end(player.buffered.length - 1) / player.duration) * 100
      : 0
    $buffered.style.width = buffered + '%'
  })

  player.on(['videosourcechange'], () => {
    $buffered.style.width = '0%'
    $played.style.width = '0%'
    $playedDto.style.transform = `translateX(0%)`
  })

  $.render($dom, el)
}

export default render
