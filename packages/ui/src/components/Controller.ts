import { isMobile } from '@oplayer/core'
import { controllerHidden, error, settingShown } from '../style'
import type { UIInterface } from '../types'
import { addClass, debounce, hasClass, removeClass } from '../utils'
import renderControllerBar from './ControllerBar'
import renderControllerBottom from './ControllerBottom'

const CTRL_HIDE_DELAY = 1500

const render = (it: UIInterface) => {
  const { player, config } = it
  let played = false

  renderControllerBar(it)
  renderControllerBottom(it)

  if (config.showControls == 'played') {
    addClass(player.$root, controllerHidden)

    player.on('play', () => {
      played = true
    })
    player.on(['videosourcechange'], () => {
      played = false
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
    if (config.showControls == 'played' && !played) return
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

  it.toggleController = function toggle() {
    if (hasClass(player.$root, controllerHidden)) {
      showCtrl()
    } else {
      hideCtrl()
    }
  }
}

export default render
