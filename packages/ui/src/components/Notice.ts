import type { Player } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { controllerHidden } from '../style'
import { debounce, removeClass } from '../utils'

const noticeCls = $.css({
  position: 'absolute',
  display: 'none',
  top: '1em',
  left: '1em',
  right: '1em',
  'z-index': 99,
  'margin-top': 'var(--controller-top-height)',

  [`@global .${controllerHidden} &`]: { 'margin-top': 0 }
})

const noticeTextCls = $.css(`
  -moz-user-select: all;
  -webkit-user-select: all;
  -ms-user-select: all;
  user-select: all;
  color: #fff;
  background-color: var(--shadow-background-color);
  border-radius: 2px;
  padding: 5px 10px;
  font-size: 0.875em;
`)

const topCenter = $.css`
  text-align: center;
`

const topRight = $.css`
  text-align: right;
`

const leftBottom = $.css`
  bottom: 6em;
  top: initial;
`

const center = $.css`
  top: 50%;
  text-align: center;
  transform: translateY(-50%);
`

const POS_CLS = {
  center: center,
  left: '',
  'top-left': '',
  top: topCenter,
  'top-center': topCenter,
  'top-right': topRight,
  right: topRight,
  bottom: leftBottom,
  'left-bottom': leftBottom
}

const NOTICE_HIDE_DELAY = 2000

const noticeShowCls = $.css('display:block;')

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${noticeCls}`,
    { 'aria-label': 'Notice' },
    `<span class="${noticeTextCls}"></span>`
  )

  const $text: HTMLSpanElement = $dom.querySelector(`.${noticeTextCls}`)!
  const { callee: delayHide } = debounce(() => removeClass($dom, noticeShowCls), NOTICE_HIDE_DELAY)

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
                show((<Error>error).message)
                return error
              })
            } else {
              return returnValue
            }
          }
      })
    }
  )

  function show(text: string, pos?: keyof typeof POS_CLS) {
    $text.innerHTML = text
    $dom.className = `${noticeCls} ${noticeShowCls} ${POS_CLS[pos || 'left']}`
    delayHide()
  }

  player.on('notice', ({ payload }) => show(payload.text))

  $.render($dom, el)

  return show
}

export default render
