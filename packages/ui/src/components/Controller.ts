import Player, { $, isMobile } from '@oplayer/core'
import { controllerHidden, error, settingShown } from '../style'
import type { UiConfig } from '../types'
import { addClass, debounce, hasClass, removeClass } from '../utils'
import renderControllerBottom from './ControllerBottom'
import renderProgress from './Progress'

const controllerBottom = $.css({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  'z-index': 97,
  padding: '0 1em',
  transition: 'transform 0.3s ease, padding 0.3s ease',
  '&::before': {
    position: 'absolute',
    content: "''",
    width: '100%',
    display: 'block',
    bottom: 0,
    left: 0,
    'z-index': -1,
    top: '-1em',
    transition: 'opacity 0.3s ease',
    'pointer-events': 'none',
    'background-image': 'linear-gradient(transparent, rgba(0, 0, 0, .3))'
  }
})

const CTRL_HIDE_DELAY = 1500

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const $dom = $.render($.create(`div.${controllerBottom}`), el)
  const exp = renderProgress(player, $dom, config)
  const { cls } = renderControllerBottom(player, $dom, config)

  $.css({
    [`@global .${controllerHidden}`]: {
      cursor: 'none',
      [`& .${controllerBottom}`]: config.miniProgressBar
        ? {
            transform: 'translateY(calc(100% - 6px))',
            padding: 0,
            'pointer-events': 'none',
            '&::before': { opacity: 0 }
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
      hasClass(player.$root, settingShown) ||
      hasClass(player.$root, error) ||
      (player.$root.contains(document.activeElement) && document.activeElement?.tagName == 'INPUT')
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
    cls,
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
