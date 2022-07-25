import Player, { $, isMobile } from '@oplayer/core'
import renderProgress from './Progress'
import renderControllerBottom from './ControllerBottom'
import type { SnowConfig } from '../types'

const hide = $.css({
  bottom: '-46px !important',
  padding: '0 !important'
  // 'background-image': 'none !important' // TODO:
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

const debounce = (fn: () => void, ms: number = CTRL_HIDE_DELAY) => {
  let time: NodeJS.Timeout | null = null
  return () => {
    time && clearTimeout(time)
    time = setTimeout(() => {
      fn()
    }, ms)
  }
}

const render = (player: Player, el: HTMLElement, config: SnowConfig) => {
  const $dom = $.create(`div.${controllerBar}`)

  renderProgress(player, $dom)
  renderControllerBottom(player, $dom, config)
  $.render($dom, el)

  const hideCtrl = () => {
    $dom.classList.add(hide)
    player.emit('theme/snow:bar/hide')
  }

  const debounceHideCtrl = debounce(hideCtrl)
  const autoHideCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    ctrlAutoHideTimer = setTimeout(hideCtrl, CTRL_HIDE_DELAY)
  }
  const showCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    $dom.classList.remove(hide)
    player.emit('theme/snow:bar/show')
  }

  player.on('play', () => {
    autoHideCtrl()
  })

  player.on('pause', () => {
    if (isMobile) {
      showCtrl()
    } else {
      hideCtrl()
    }
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
  }
}

export default render
