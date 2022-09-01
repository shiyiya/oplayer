import Player, { $ } from '@oplayer/core'
import initListener from '../listeners/init'
import { settingShown } from '../style'
import type { UiConfig } from '../types'
import { addClass, debounce, hasClass, isMobile, removeClass } from '../utils'
import renderControllerBottom from './ControllerBottom'
import renderProgress from './Progress'

const mini = $.css({
  transform: 'translateY(calc(100% - 7px))',
  padding: '0 !important',
  'pointer-events': 'none'
  // 'background-image': 'none !important' // TODO:
})

const hide = $.css({
  transform: 'translateY(100%)'
})

const controllerBar = $.css({
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '0',
  'z-index': '98',
  padding: '0 15px',
  transition: 'transform 0.3s ease, padding 0.3s ease',
  'background-image': 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))'
})

const CTRL_HIDE_DELAY = 1500

const render = (
  player: Player,
  el: HTMLElement,
  config: UiConfig,
  onShow?: Function,
  onHide?: Function
) => {
  const $dom = $.create(`div.${controllerBar}`)
  renderProgress(player, $dom, config)
  renderControllerBottom(player, $dom, config)
  $.render($dom, el)

  const hideCls = config.miniProgressBar ? mini : hide

  const hideCtrl = () => {
    if (
      !initListener.isInitialized() ||
      (!player.isPlaying && !isMobile) ||
      hasClass($dom, hideCls) ||
      hasClass(player.$root, settingShown)
    ) {
      return
    }
    addClass($dom, hideCls)
    onHide?.()
  }

  const { callee: debounceHideCtrl, clear: cancelHideCtrl } = debounce(hideCtrl, CTRL_HIDE_DELAY)

  const showCtrl = () => {
    if (hasClass($dom, hideCls)) {
      cancelHideCtrl()
      removeClass($dom, hideCls)
      onShow?.()
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
  } else {
    player.on('controllervisibilitychange', () => {
      if (hasClass($dom, hideCls)) {
        showCtrl()
      } else {
        hideCtrl()
      }
    })
  }
}

export default render
