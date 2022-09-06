import type { Player, PlayerEvent } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { addClass, debounce, formatTime, removeClass } from '../utils'

const noticeCls = $.css`
  position: absolute;
  display: none;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 99;
`

const noticeTextCls = $.css(`
  -moz-user-select: all;
  -webkit-user-select: all;
  -ms-user-select: all;
  user-select: all;
  color: #fff;
  background-color: var(--shadow-background-color);
  border-radius: 2px;
  padding: 5px 10px;
  font-size: 14px;
`)

const NOTICE_HIDE_DELAY = 2000

const noticeShowCls = $.css('display:block;')

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${noticeCls}`,
    { 'aria-label': 'Notice' },
    `<span class="${noticeTextCls}"></span>`
  )

  const $text: HTMLDivElement = $dom.querySelector(`.${noticeTextCls}`)!
  const { callee: delayHide } = debounce(() => removeClass($dom, noticeShowCls), NOTICE_HIDE_DELAY)

  function toggle(fn: Function) {
    return (...arg: any[]) => (fn(...arg), addClass($dom, noticeShowCls), delayHide())
  }

  ;(['play', 'pause', 'enterFullscreen', 'exitFullscreen', 'enterPip', 'exitPip'] as const).forEach(
    (key) => {
      const fn: any = player[key].bind(player)
      Object.defineProperty(player, key, {
        get:
          () =>
          (...arg: any[]) => {
            const returnValue = fn(...arg)
            if ((<Promise<any>>returnValue)?.catch) {
              return (<Promise<any>>returnValue).catch((error) => {
                toggle(() => ($text.innerText = (<Error>error).message))()
                return error
              })
            } else {
              return returnValue
            }
          }
      })
    }
  )

  player.on(
    'seeking',
    toggle(() => {
      $text.innerText = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`
    })
  )

  let muted = player.isMuted
  player.on(
    'volumechange',
    toggle(() => {
      if (muted != player.isMuted) {
        muted = player.isMuted
        if (muted) {
          $text.innerText = player.locales.get('Mute')
          return
        }
      }
      $text.innerText = player.locales.get('Volume: %s', `${~~(player.volume * 100)}%`)
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
