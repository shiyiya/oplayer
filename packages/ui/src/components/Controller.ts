import Player, { $, isMobile } from '@oplayer/core'
import { controllerHidden, settingShown } from '../style'
import type { UiConfig } from '../types'
import { addClass, debounce, hasClass, removeClass } from '../utils'
import renderControllerBottom from './ControllerBottom'
import renderProgress from './Progress'

const controllerBottom = $.css({
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '0',
  'z-index': '97',
  padding: '0 1.25em',
  transition: 'transform 0.3s ease, padding 0.3s ease',
  'background-image': 'linear-gradient(transparent, rgba(0, 0, 0, .2), rgba(0, 0, 0, .4))'
})

const controllerTop = $.css({
  position: 'absolute',
  left: '0',
  right: '0',
  top: '0',
  'z-index': '97',
  transition: 'transform 0.3s ease, padding 0.3s ease',
  'background-image': 'linear-gradient(rgba(0, 0, 0, .4), rgba(0, 0, 0, .2), transparent)',
  height: 'var(--controller-top-height)',
  [`@global .${controllerHidden} &`]: {
    transform: 'translateY(calc(-100%))'
  }
})

const titleCls = $.css(`color: #fff;font-size:1.5em;margin-left:1em;`)

const CTRL_HIDE_DELAY = 1500

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const { source, isLive } = player.options

  if (config.appBar) {
    const $top = $.render(
      $.create(`div.${controllerTop}`, {}, `<h2 class=${titleCls}>${source.title}</h2>`),
      el
    )

    if (!source.title) $top.style.display = 'none'
    player.on('videosourcechange', ({ payload: { title } }) => {
      if (title) {
        $top.querySelector<HTMLDivElement>(`.${titleCls}`)!.innerText = title
        $top.style.display = 'block'
      } else {
        $top.style.display = 'none'
      }
    })
  }

  let exp = {}
  const $dom = $.render($.create(`div.${controllerBottom}`), el)

  if (!isLive) exp = renderProgress(player, $dom, config)
  renderControllerBottom(player, $dom, config)

  $.css({
    [`@global .${controllerHidden}`]: {
      cursor: 'none',
      [`& .${controllerBottom}`]: config.miniProgressBar
        ? {
            transform: 'translateY(calc(100% - 7px))',
            padding: '0',
            'pointer-events': 'none'
          }
        : {
            transform: 'translateY(100%)'
          }
    }
  })

  const hideCtrl = () => {
    if (
      (!player.isPlaying && !isMobile) ||
      hasClass(player.$root, controllerHidden) ||
      hasClass(player.$root, settingShown)
    ) {
      return
    }
    addClass(player.$root, controllerHidden)
  }

  const { callee: debounceHideCtrl, clear: cancelHideCtrl } = debounce(hideCtrl, CTRL_HIDE_DELAY)

  const showCtrl = () => {
    if (hasClass(player.$root, controllerHidden)) {
      cancelHideCtrl()
      removeClass(player.$root, controllerHidden)
    }
  }

  player.on('play', debounceHideCtrl)
  player.on(['pause', 'videosourcechange'], showCtrl)

  if (!isMobile) {
    player.$root.addEventListener('mousemove', () => {
      showCtrl()
      debounceHideCtrl()
    })
    player.$root.addEventListener('mouseleave', hideCtrl)
  }

  return {
    exp,
    toggle() {
      if (hasClass(player.$root, controllerHidden)) {
        showCtrl()
      } else {
        hideCtrl()
      }
    }
  }
}

export default render
