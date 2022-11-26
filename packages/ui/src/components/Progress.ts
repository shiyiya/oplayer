import type Player from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { Icons } from '../functions'
import { UiConfig } from '../types'
import { DRAG_EVENT_MAP, formatTime } from '../utils'
import renderHighlight, { highlightCls } from './highlight'
import renderThumbnail from './thumbnail'
import renderVTTThumbnail from './vtt-thumbnails'
import {
  buffered,
  dot,
  hit,
  played,
  progress,
  progressDragging,
  progressInner
} from './Progress.style'

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const $dom = $.create(
    `div.${progress}`,
    {},
    `<div class=${progressInner}>
      <div class="${hit}">00:00</div>
      <div class="${buffered}" style="width:0%"></div>
      <div class="${played}" style="width:0%"></div>
      <div class="${dot}" style="transform: translateX(0%);">
        ${Icons.get('progressIndicator') || `<span />`}
      </div>
  </div>`
  )
  const firstElement = $dom.firstElementChild! as HTMLDivElement
  const {
    init: initThumbnail,
    update: thumbnailUpdater,
    change
  } = config.thumbnails?.isVTT
    ? renderVTTThumbnail(player, firstElement, config.thumbnails)
    : renderThumbnail(player, firstElement, config.thumbnails)

  const highlight = renderHighlight(player, firstElement, config.highlight)

  const $buffered = $dom.querySelector<HTMLDivElement>(`.${buffered}`)!
  const $played = $dom.querySelector<HTMLDivElement>(`.${played}`)!
  const $playedDto = $dom.querySelector<HTMLDivElement>(`.${dot}`)!
  const $hit = $dom.querySelector<HTMLDivElement>(`.${hit}`)!
  let isDargMoving = false

  const getSlidingValue = (event: MouseEvent | TouchEvent) => {
    const rect = $dom.getBoundingClientRect()
    const value =
      (((<MouseEvent>event).clientX || (<TouchEvent>event).changedTouches[0]!.clientX) -
        rect.left) /
      rect.width
    return value >= 1 ? 1 : value <= 0 ? 0 : value
  }

  const sync = (e: MouseEvent | TouchEvent) => {
    const rate = getSlidingValue(e)
    const percentage = rate * 100
    $played.style.width = percentage + '%'
    $playedDto.style.transform = `translateX(${percentage}%)`
    $hit.innerText = formatTime(player.duration * rate)
    $hit.style.left = `${percentage}%`
    return rate
  }

  // dragging
  $dom.addEventListener(DRAG_EVENT_MAP.dragStart, (e) => {
    isDargMoving = true
    $dom.classList.add(progressDragging)
    initThumbnail()
    thumbnailUpdater(sync(e))

    function moving(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      thumbnailUpdater(sync(e))
    }

    document.addEventListener(DRAG_EVENT_MAP.dragMove, moving, { passive: false })
    document.addEventListener(
      DRAG_EVENT_MAP.dragEnd,
      (e) => {
        $dom.classList.remove(progressDragging)
        isDargMoving = false
        document.removeEventListener(DRAG_EVENT_MAP.dragMove, moving)
        player.seek(getSlidingValue(e) * player.duration)
      },
      { once: true }
    )
  })

  if (!isMobile) {
    $dom.addEventListener('mouseenter', () => {
      if (isDargMoving) return
      initThumbnail()
    })

    $dom.addEventListener(
      'mousemove',
      (e) => {
        if (isDargMoving) return
        $dom.classList.add(progressDragging)
        if ((<HTMLDivElement>e.target).classList.contains(highlightCls)) {
          $hit.style.display = 'none'
        } else {
          $hit.removeAttribute('style')
        }

        const rate = getSlidingValue(e)
        $hit.innerText = formatTime(player.duration * rate)
        $hit.style.left = `${rate * 100}%`
        thumbnailUpdater(rate)
      },
      { passive: false }
    )

    $dom.addEventListener('mouseleave', () => {
      if (!isDargMoving) $dom.classList.remove(progressDragging)
    })
  }

  player.on(['timeupdate', 'seeking'], () => {
    if (isDargMoving) return
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

  return {
    highlight,
    thumbnails: change
  }
}

export default render
