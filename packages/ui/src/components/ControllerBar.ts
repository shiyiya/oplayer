import Player, { $ } from '@oplayer/core'
import initListener from '../listeners/init'
import type { SnowConfig } from '../types'
import { debounce, isMobile } from '../utils'
import renderControllerBottom from './ControllerBottom'
import renderProgress from './Progress'

const mini = $.css({
  bottom: isMobile ? '-36px !important' : '-46px !important',
  padding: '0 !important'
  // 'background-image': 'none !important' // TODO:
})

const hide = $.css({
  bottom: isMobile ? '-40px !important' : '-50px !important'
})

const controllerBar = $.css({
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '0',
  padding: '0 15px',
  transition: 'all 0.3s ease',
  'background-image': 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))'
})

let CTRL_HIDE_DELAY = 1500
let ctrlAutoHideTimer: NodeJS.Timeout | null = null

const render = (player: Player, el: HTMLElement, config: SnowConfig) => {
  const $dom = $.create(`div.${controllerBar}`)
  renderProgress(player, $dom)
  renderControllerBottom(player, $dom, config)
  $.render($dom, el)

  const hideCls = config.miniProgressBar ? mini : hide

  const hideCtrl = () => {
    if (!initListener.isInit() || (!player.isPlaying && !isMobile)) return
    $dom.classList.add(hideCls)
    player.emit('ui/controllerbar:hide')
  }

  const debounceHideCtrl = debounce(hideCtrl, CTRL_HIDE_DELAY)
  const autoHideCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    ctrlAutoHideTimer = setTimeout(hideCtrl, CTRL_HIDE_DELAY)
  }

  const showCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    $dom.classList.remove(hideCls)
    player.emit('ui/controllerbar:show')
  }

  player.on('play', () => {
    autoHideCtrl()
  })

  player.on('pause', () => {
    showCtrl()
  })

  player.on('videosourcechange', () => {
    showCtrl()
    autoHideCtrl()
  })

  if (!isMobile) {
    player.on('mousemove', () => {
      showCtrl()
      debounceHideCtrl()
    })
    player.on('mouseleave', hideCtrl)
  } else {
    player.on('ui/controller:toggle', () => {
      if ($dom.classList.contains(hideCls)) {
        showCtrl()
      } else {
        hideCtrl()
      }
    })
  }
}

export default render
