import { $ } from '@oplayer/core'
import { controllerHidden } from '../style'
import { debounce, removeClass } from '../utils'
import { UIInterface } from '../types'

const noticeCls = $.css({
  position: 'absolute',
  display: 'none',
  top: '0.625em',
  left: '0.625em',
  right: '0.625em',
  'z-index': 9,
  'margin-top': 'var(--control-bar-height)',
  transition: 'margin 0.2s',
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

const render = (it: UIInterface) => {
  const { player, $root: el } = it
  const $dom = $.create(
    `div.${noticeCls}`,
    { 'aria-label': 'Notice' },
    `<span class="${noticeTextCls}"></span>`
  )

  const $text: HTMLSpanElement = $dom.querySelector(`.${noticeTextCls}`)!
  const { callee: delayHide } = debounce(() => removeClass($dom, noticeShowCls), NOTICE_HIDE_DELAY)

  function show(text: string, pos?: keyof typeof POS_CLS) {
    $text.innerHTML = text
    $dom.className = `${noticeCls} ${noticeShowCls} ${POS_CLS[pos || 'left']}`
    delayHide()
  }

  player.on('notice', ({ payload }) => show(payload.text, payload.pos))

  it.notice = show

  $.render($dom, el)

  return show
}

export default render
