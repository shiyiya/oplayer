import { $, isMobile } from '@oplayer/core'
import { controllerHidden, error, hidden, settingShown } from '../style'
import type { UIInterface } from '../types'
import { addClass, debounce, hasClass, removeClass } from '../utils'
import renderControllerBar from './ControllerBar'
import renderControllerBottom from './ControllerBottom'

const CTRL_HIDE_DELAY = 1500

const render = (it: UIInterface) => {
  const { player, config, $root } = it

  const $controller = $.create('div')

  renderControllerBar(it, $controller)
  renderControllerBottom(it, $controller)

  if (config.showControls == 'played') {
    addClass($controller, hidden)

    player.once('play', () => {
      removeClass($controller, hidden)
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
    player.emit('controllervisibilitychange', false)
  }

  const { callee: debounceHideCtrl, clear: cancelHideCtrl } = debounce(hideCtrl, CTRL_HIDE_DELAY)

  const showCtrl = () => {
    cancelHideCtrl()
    if (hasClass(player.$root, controllerHidden)) {
      removeClass(player.$root, controllerHidden)
      player.emit('controllervisibilitychange', true)
    }
  }

  player.on('play', debounceHideCtrl)
  player.on(['pause', 'videosourcechange'], showCtrl)
  player.on('destroy', cancelHideCtrl)

  if (!isMobile) {
    player.$root.addEventListener('mousemove', () => {
      showCtrl()
      debounceHideCtrl()
    })
    player.$root.addEventListener('mouseleave', hideCtrl)
  }

  it.toggleController = function toggle() {
    if (hasClass($controller, hidden)) {
      player.play()
      return
    }
    if (hasClass(player.$root, controllerHidden)) {
      showCtrl()
    } else {
      hideCtrl()
    }
  }

  $.render($controller, $root)
}

export default render
