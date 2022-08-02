import { $ } from '@oplayer/core'
import type { Player, PlayerEvent } from '@oplayer/core'
import { formatTime } from '../utils'

const noticeTextStyles = $.css`
    color: #fff;
    background-color: #0009;
    border-radius: 2px;
    padding: 5px 10px;
    font-size: 14px;
`

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      pointer-events: none;
      position: absolute;
      display: none;
      top: 10px;
      left: 10px;
      `}`,
    {},
    `<div class="${noticeTextStyles}"></div>`
  )

  const $text: HTMLDivElement = $dom.querySelector(`.${noticeTextStyles}`)!

  function show() {
    $dom.style.display = 'block'
  }

  let timer: NodeJS.Timeout
  function delayhide() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      $dom.style.display = 'none'
    }, 1500)
  }

  function toggle(fn: Function) {
    return (...arg: any[]) => (fn(...arg), show(), delayhide())
  }

  player.on(
    'seeking',
    toggle(() => {
      $text.innerText = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
    })
  )

  player.on(
    'volumechange',
    toggle(() => {
      $text.innerText = `Vol: ${~~(player.volume * 100)}%`
    })
  )

  player.on(
    'notice',
    toggle((e: PlayerEvent) => {
      $text.innerText = e.payload.text
    })
  )

  $.render($dom, el)
}

export default render
