import type Player from '@oplayer/core'
import { $ } from '@oplayer/core'
import playSvg from '../icons/play.svg?raw'
import { initListener } from '../listeners/init'
import { icon } from '../style'

const styles = $.css({
  height: '100%',
  width: '100%',

  '& > button': {
    position: 'absolute',
    right: '40px',
    bottom: '50px',
    fill: '#fff',
    width: '3.5em'
  },

  '& svg': {
    filter: 'drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3))'
  },

  '@media only screen and (max-width: 991px)': {
    '& > button': {
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
    `<button aria-label="Play" class="${icon}" type="button">
        ${playSvg}
      </button>`
  )
  const $button = <HTMLButtonElement>$dom.querySelector('button')!

  $button.addEventListener('click', (e) => {
    e.stopPropagation()
    player.togglePlay()
  })

  $dom.addEventListener('click', () => {
    player.togglePlay()
  })

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

  $.render($dom, el)
}

export default render
