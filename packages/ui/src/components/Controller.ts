import Player, { $, isMobile } from '@oplayer/core'
import { controllerHidden, error, settingShown } from '../style'
import type { UiConfig } from '../types'
import { addClass, debounce, hasClass, removeClass } from '../utils'
import renderControllerBottom from './ControllerBottom'
import renderControllerBar from './ControllerBar'

const controllerBottomWrap = $.css({
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
  },

  [`@global .${controllerHidden} &`]: {
    padding: 0,
    'pointer-events': 'none',
    transform: 'translateY(calc(100% - 8px))',
    '&::before': { opacity: 0 }
  }
})

const CTRL_HIDE_DELAY = 1500

const hidden = $.css(`visibility:hidden;opacity:0;`)

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  const $dom = $.render($.create(`div.${controllerBottomWrap}`), el)
  const controllerBar = renderControllerBar(player, el, config)
  const controllerBottom = renderControllerBottom(player, $dom, config)

  if (!config.miniProgressBar) {
    $.css({
      [`@global .${controllerHidden} .${controllerBottomWrap}`]: {
        transform: 'translateY(100%)'
      }
    })
  }

  if (config.showControls == 'played') {
    addClass($dom, hidden)

    player.on('error', () => removeClass($dom, hidden))
    player.on('play', () => removeClass($dom, hidden), { once: true })
    player.on(['videosourcechange'], () => {
      addClass($dom, hidden)
      player.on('play', () => removeClass($dom, hidden), { once: true })
    })
  }

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
    player.emit('controllervisibilitychange', true)
  }

  const { callee: debounceHideCtrl, clear: cancelHideCtrl } = debounce(hideCtrl, CTRL_HIDE_DELAY)

  const showCtrl = () => {
    cancelHideCtrl()
    if (hasClass(player.$root, controllerHidden)) {
      removeClass(player.$root, controllerHidden)
      player.emit('controllervisibilitychange', false)
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
    cls: {
      ...controllerBar.cls,
      ...controllerBottom.cls
    },
    toggle() {
      if (hasClass($dom, hidden)) {
        player.play()
        return
      }
      if (hasClass(player.$root, controllerHidden)) {
        showCtrl()
      } else {
        hideCtrl()
      }
    }
  }
}

export default render
