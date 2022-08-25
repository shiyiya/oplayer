import Player, { $ } from '@oplayer/core'
import initListener from '../listeners/init'
import { settingShown } from '../style'
import type { UiConfig } from '../types'
import { addClass, debounce, hasClass, isMobile, removeClass } from '../utils'
import renderControllerBottom from './ControllerBottom'
import renderProgress from './Progress'

const mini = $.css({
  bottom: isMobile ? '-31px !important' : '-41px !important',
  padding: '0 !important',
  'pointer-events': 'none'
  // 'background-image': 'none !important' // TODO:
})

const hide = $.css({
  bottom: isMobile ? '-45px !important' : '-55px !important'
})

const controllerBar = $.css({
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '0',
  'z-index': '98',
  padding: '0 15px',
  transition: 'bottom 0.3s ease, padding 0.3s ease',
  'background-image': 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))'
})

let CTRL_HIDE_DELAY = 1500
let ctrlAutoHideTimer: NodeJS.Timeout | null = null

const render = (
  player: Player,
  el: HTMLElement,
  config: UiConfig,
  onShow?: Function,
  onHide?: Function
) => {
  const $dom = $.create(`div.${controllerBar}`)
  renderProgress(player, $dom)
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

  const debounceHideCtrl = debounce(hideCtrl, CTRL_HIDE_DELAY)
  const autoHideCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    ctrlAutoHideTimer = setTimeout(hideCtrl, CTRL_HIDE_DELAY)
  }

  const showCtrl = () => {
    if (hasClass($dom, hideCls)) {
      ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
      removeClass($dom, hideCls)
      onShow?.()
    }
  }

  player.on('play', autoHideCtrl)
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
