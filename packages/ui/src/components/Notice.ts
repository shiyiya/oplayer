import { $ } from '@oplayer/core'
import type { Player, PlayerEvent } from '@oplayer/core'
import { addClass, formatTime, removeClass } from '../utils'

const noticeCls = $.css`
  pointer-events: none;
  position: absolute;
  display: none;
  top: 10px;
  left: 10px;
`

const noticeTextCls = $.css`
  color: #fff;
  background-color: rgba(21, 21, 21, .9);
  border-radius: 2px;
  padding: 5px 10px;
  font-size: 14px;
`

const noticeShowCls = $.css('display:block;')

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(`div.${noticeCls}`, {}, `<div class="${noticeTextCls}"></div>`)

  const $text: HTMLDivElement = $dom.querySelector(`.${noticeTextCls}`)!

  let timer: NodeJS.Timeout
  function delayhide() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      removeClass($dom, noticeShowCls)
    }, 2000)
  }

  function toggle(fn: Function) {
    return (...arg: any[]) => (fn(...arg), addClass($dom, noticeShowCls), delayhide())
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
