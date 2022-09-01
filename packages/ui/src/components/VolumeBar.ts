import type Player from '@oplayer/core'
import { $ } from '@oplayer/core'
import { DRAG_EVENT_MAP } from '../utils'
import { line, slider, sliderWrap, thumb, track, volumeValue, wrap } from './VolumeBar.style'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${wrap}`,
    {},
    `<div class=${volumeValue}>100</div>

    <div class=${track}>
        <div class=${sliderWrap}>
          <div class=${slider}>
            <div class=${line}></div>
          </div>

          <div class=${thumb}></div>
        <div>
      </div>`
  )

  const $track = $dom.querySelector<HTMLDivElement>(`.${track}`)!
  const $thumb = $dom.querySelector<HTMLDivElement>(`.${thumb}`)!
  const $volumeSlider = $dom.querySelector<HTMLDivElement>(`.${line}`)!
  const $volumeValue = $dom.querySelector<HTMLDivElement>(`.${volumeValue}`)!

  const getSlidingValue = (event: MouseEvent | TouchEvent) => {
    const rect = $track.getBoundingClientRect()
    const value =
      (rect.bottom -
        ((<MouseEvent>event).clientY || (<TouchEvent>event).changedTouches[0]!.clientY)) /
      rect.height
    return value >= 1 ? 1 : value <= 0 ? 0 : value
  }

  const sync = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    player.setVolume(setter(getSlidingValue(e)))
  }

  const setter = (value: number) => {
    $volumeValue.innerText = `${~~(value * 100)}`
    $volumeSlider.style.transform = `scaleY(${value})`
    $thumb.style.bottom = `calc(${~~(value * 100)}% - 6px)`
    return value
  }

  setter(player.volume)
  player.on('volumechange', () => {
    setter(player.isMuted ? 0 : player.volume)
  })

  $track.addEventListener(DRAG_EVENT_MAP.dragStart, (e: MouseEvent | TouchEvent) => {
    sync(e)

    document.addEventListener(DRAG_EVENT_MAP.dragMove, sync, { passive: false })
    document.addEventListener(
      DRAG_EVENT_MAP.dragEnd,
      () => {
        document.removeEventListener(DRAG_EVENT_MAP.dragMove, sync)
      },
      { once: true }
    )
  })

  $.render($dom, el)
}

export default render
