import { $ } from '@oplayer/core'
import type Player from '@oplayer/core'
import pauseSvg from './icons/pause.svg?raw'
import playSvg from './icons/play.svg?raw'
import { unsafeSVG } from 'lit/directives/unsafe-svg'

const styles = $.css({
  fill: 'currentcolor',
  position: 'absolute',
  right: '40px',
  bottom: '45px',

  '& > .oh-icon': {
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

    '& > .oh-icon': {
      width: '2.5em'
    }
  }
})

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `<div class=${styles} aria-label="Play">
        <button
          aria-label="Play"
          class="oh-icon play"
          type="button"
          @click=${() => player.togglePlay()}
        >
          ${unsafeSVG(player.isPlaying ? pauseSvg : playSvg)}
        </button>
      </div>`
  )

  player.on(['play', 'pause', 'seeking', 'canplay'], () => {
    if (player.isLoading || player.isLoading) {
      $dom.style.display = 'none'
    } else {
      $dom.removeAttribute('style')
    }
  })

  $.render($dom, el)
}

export default render
