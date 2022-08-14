import type Player from '@oplayer/core'
import { $ } from '@oplayer/core'
import { DRAG_EVENT_MAP, formatTime, isMobile } from '../utils'
import { buffered, dot, hit, played, progress, progressInner } from './Progress.style'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${progress}`,
    {},
    `<div class=${progressInner}>
      ${!isMobile ? `<div class="${hit}">00:00</div>` : ''}
      <div class="${buffered}" style="width:0%"></div>
      <div class="${played}" style="width:0%"></div>
      <div class="${dot}" style="transform: translateX(0%);"></div>
  </div>`
  )

  const $buffered = $dom.querySelector<HTMLDivElement>(`.${buffered}`)!
  const $played = $dom.querySelector<HTMLDivElement>(`.${played}`)!
  const $playedDto = $dom.querySelector<HTMLDivElement>(`.${dot}`)!
  const $hit = $dom.querySelector<HTMLDivElement>(`.${hit}`)
  let isDargMoving = false

  //TODO: utils
  const getSlidingValue = (event: MouseEvent | TouchEvent) => {
    const rect = $dom.getBoundingClientRect()
    const value =
      (((<MouseEvent>event).clientX || (<TouchEvent>event).changedTouches[0]!.clientX) -
        rect.left) /
      rect.width
    return value >= 1 ? 1 : value <= 0 ? 0 : value
  }

  const sync = (e: MouseEvent | TouchEvent) => {
    const rate = getSlidingValue(e) * 100
    $played.style.width = rate + '%'
    $playedDto.style.transform = `translateX(${rate}%)`
    if ($hit) {
      $hit.innerText = formatTime(player.duration * (rate / 100))
      $hit.style.left = `${rate}%`
    }
  }

  $dom.addEventListener(DRAG_EVENT_MAP.dragStart, (e) => {
    isDargMoving = true
    sync(e)
  })

  $dom.addEventListener(
    DRAG_EVENT_MAP.dragMove,
    (e) => {
      if (isDargMoving) {
        sync(e)
      } else {
        if ($hit) {
          const rate = getSlidingValue(e)
          $hit.innerText = formatTime(player.duration * rate)
          $hit.style.left = `${rate * 100}%`
        }
      }
    },
    { passive: false }
  )

  $dom.addEventListener(DRAG_EVENT_MAP.dragEnd, (e) => {
    isDargMoving = false
    player.seek(getSlidingValue(e) * player.duration)
  })

  player.on(['timeupdate', 'seeking'], () => {
    const { currentTime, duration } = player
    const playedWidth = (currentTime / duration) * 100 || 0
    $played.style.width = playedWidth + '%'
    $playedDto.style.transform = `translateX(${playedWidth}%)`
  })

  player.on('progress', () => {
    const buffered = player.buffered.length
      ? (player.buffered.end(player.buffered.length - 1) / player.duration) * 100
      : 0
    $buffered.style.width = buffered + '%'
  })

  player.on('videosourcechange', () => {
    $buffered.style.width = '0%'
    $played.style.width = '0%'
    $playedDto.style.transform = `translateX(0%)`
  })

  $.render($dom, el)
}

export default render
