import { $ } from '@oplayer/core'
import { icon } from '../style'
import playSvg from '../icons/play.svg?raw'
import type Player from '@oplayer/core'

const styles = $.css({
  fill: 'currentcolor',
  position: 'absolute',
  right: '40px',
  bottom: '45px',

  [`& > .${icon}`]: {
    width: '3em',

    '& > svg': {
      fill: 'currentcolor',
      filter: 'drop-shadow(0px 0px 5px var(--shadow-color))'
    }
  },

  '@media only screen and (max-width: 991px)': {
    '&': {
      position: 'absolute',
      right: 'unset',
      bottom: 'unset',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },

    [`& > .${icon}`]: {
      width: '2.5em'
    }
  }
})

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${styles}`,
    { 'aria-label': 'Play' },
    `<button aria-label="Play" class="${icon} play" type="button">
        ${playSvg}
      </button>`
  )

  $dom.querySelector('button')?.addEventListener('click', () => {
    player.togglePlay()
  })

  player.on(['play', 'pause', 'seeking', 'canplay'], () => {
    if (player.isPlaying || player.isLoading) {
      $dom.style.display = 'none'
    } else {
      $dom.removeAttribute('style')
    }
  })

  $.render($dom, el)
}

export default render
