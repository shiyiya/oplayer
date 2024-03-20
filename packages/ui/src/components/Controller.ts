import { $, isMobile } from '@oplayer/core'
import { DATA_CONTROLLER_HIDDEN, controllerHidden, error, hidden, settingShown } from '../style'
import type { UIInterface } from '../types'
import { addClass, debounce, hasClass, removeClass } from '../utils'
import renderControllerBar from './ControllerBar'
import renderControllerBottom from './ControllerBottom'

const CTRL_HIDE_DELAY = 2000

const render = (it: UIInterface) => {
  const { player, config, $root } = it

  const $controller = $.create('div')

  renderControllerBar(it, $controller)
  renderControllerBottom(it, $controller)

  const { display: showControls, displayBehavior: ctrlHideBehavior } = config.theme.controller || {}

  if (showControls == 'played') {
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
    player.$root.setAttribute(DATA_CONTROLLER_HIDDEN, 'true')
    player.emit('controlshidden', false)
  }

  const { callee: debounceHideCtrl, clear: cancelHideCtrl } = debounce(hideCtrl, CTRL_HIDE_DELAY)

  const showCtrl = () => {
    cancelHideCtrl()
    if (hasClass(player.$root, controllerHidden)) {
      removeClass(player.$root, controllerHidden)
      player.$root.setAttribute(DATA_CONTROLLER_HIDDEN, 'false')
      player.emit('controlsshown', true)
    }
  }

  if (ctrlHideBehavior != 'none') {
    player.on('play', debounceHideCtrl)
    player.on(['pause', 'videosourcechange'], showCtrl)
    player.on('destroy', cancelHideCtrl)
  }

  if (!isMobile) {
    player.$root.addEventListener('mousemove', (e) => {
      showCtrl()
      if (!$controller.contains(<HTMLDivElement>e.target)) {
        debounceHideCtrl()
      }
    })
    if (ctrlHideBehavior == 'delay') player.$root.addEventListener('mouseleave', debounceHideCtrl)
    if (ctrlHideBehavior == 'hover') player.$root.addEventListener('mouseleave', hideCtrl)
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
