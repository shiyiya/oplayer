import type Player from '@oplayer/core'
import { $ } from '@oplayer/core'
import playSvg from '../icons/play.svg?raw'
import pauseSvg from '../icons/pause.svg?raw'

import initListener from '../listeners/init'
import { icon } from '../style'
import { isMobile } from '../utils'

const styles = $.css({
  '& > button': {
    position: 'absolute',
    right: '40px',
    bottom: '50px',
    fill: '#fff',
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
      width: '3em',
      fill: 'hsla(0,0%,100%,.9)',
      display: 'flex',
      'align-items': 'center'
    }
  }
})

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${styles}`,
    { 'aria-label': 'Play' },
    `<button aria-label="Play" class="${icon}" type="button">
        ${playSvg}
        ${isMobile ? pauseSvg : ''}
      </button>`
  )
  const $button = <HTMLButtonElement>$dom.querySelector('button')!

  $button.addEventListener('click', (e) => {
    e.stopPropagation()
    player.togglePlay()
  })

  if (!isMobile) {
    initListener.add(
      () => ($button.style.display = 'none'),
      () => {
        if (!player.isPlaying) {
          $button.style.display = 'block'
        }
      }
    )

    player.on(['canplaythrough', 'play', 'pause', 'seeking', 'videosourcechange'], () => {
      if (!initListener.isInit()) return

      if (player.isPlaying || (player.isLoading && !player.isPlaying)) {
        $button.style.display = 'none'
      } else {
        $button.style.display = 'block'
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

    initListener.add(
      () => ($dom.style.display = 'none'),
      () => {
        if (!player.isPlaying) {
          $dom.style.display = 'block'
        }
      }
    )

    player.on('ui/controllerbar:show', () => {
      $dom.style.display = 'block'
    })

    player.on('ui/controllerbar:hide', () => {
      $dom.style.display = 'none'
    })

    player.on(['play', 'pause'], siwtcher)
  }

  $.render($dom, el)
}

export default render
