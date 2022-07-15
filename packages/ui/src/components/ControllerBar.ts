import Player, { $, isMobile } from '@oplayer/core'
import renderProgress from './Progress'
import renderControllerBottom from './ControllerBottom'
import type { SnowConfig } from '../types'

const controllerBar = $.css({
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '0',
  padding: '0 15px',
  transition: 'all 0.3s ease',
  'background-image': 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))',

  '&.hide': {
    bottom: '-46px',
    padding: '0',

    // TODO: use event
    '& .oh-controller-progress-buffered,& .oh-controller-progress-played': {
      'border-radius': '0'
    }
  },

  '@media only screen and (max-width: 991px)': {
    '&.hide': {
      bottom: '-38px'
    }
  }
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

  const hideCtrl = () => $dom.classList.add('hide')

  const debounceHideCtrl = debounce(hideCtrl)
  const autoHideCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    ctrlAutoHideTimer = setTimeout(() => {
      $dom.classList.add('hide')
    }, CTRL_HIDE_DELAY)
  }
  const showCtrl = () => {
    ctrlAutoHideTimer && clearTimeout(ctrlAutoHideTimer)
    $dom.classList.remove('hide')
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
