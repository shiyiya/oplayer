import type Player from '@oplayer/core'
import { $ } from '@oplayer/core'
import pauseSvg from '../icons/pause.svg?raw'
import playSvg from '../icons/play.svg?raw'

import initListener from '../listeners/init'
import { icon } from '../style'
import { addClass, isMobile, removeClass } from '../utils'

const styles = $.css({
  display: 'none',

  '& > button': {
    position: 'absolute',
    right: '40px',
    bottom: '50px',
    fill: 'hsla(0, 0%, 100%, .8)',
    width: '3.5em'
  },

  '& svg': {
    position: isMobile ? 'absolute' : false,
    filter: 'drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3))'
  },

  '@media only screen and (max-width: 991px)': {
    '& > button': {
      position: 'absolute',
      inset: 0,
      margin: 'auto',
      width: '2.8em',
      display: 'flex',
      'align-items': 'center'
    }
  }
})

const showCls = $.css('display: block;')

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${styles}`,
    {},
    `<button aria-label="Play" class=${icon} type="button">
        ${playSvg}
        ${isMobile ? pauseSvg : ''}
      </button>`
  )
  const $button = <HTMLButtonElement>$dom.querySelector('button')!

  $dom.addEventListener('click', (e: Event) => {
    e.stopPropagation()
    player.togglePlay()
  })

  const show = () => addClass($dom, showCls)
  const hide = () => removeClass($dom, showCls)

  initListener.add(hide, () => {
    if (!player.isPlaying) show()
  })

  if (!isMobile) {
    player.on(['canplaythrough', 'play', 'pause', 'seeking', 'videosourcechange'], () => {
      if (!initListener.isInitialized()) return
      if (player.isPlaying || (player.isLoading && !player.isPlaying)) {
        hide()
      } else {
        show()
      }
    })
  } else {
    const $play = <HTMLButtonElement>$button.children[0]!
    const $pause = <HTMLButtonElement>$button.children[1]!

    function siwtcher() {
      if (player.isPlaying) {
        $play.style.display = 'none'
        $pause.style.display = 'block'
      } else {
        $play.style.display = 'block'
        $pause.style.display = 'none'
      }
    }
    siwtcher()

    player.on(['play', 'pause', 'videosourcechange'], siwtcher)
  }

  $.render($dom, el)

  // 手机上跟随 controller 显示/隐藏
  return isMobile ? { show, hide } : {}
}

export default render
