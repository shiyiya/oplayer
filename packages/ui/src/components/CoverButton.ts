import type Player from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { Icons } from '../functions/icons'

import { icon, playing, loading, controllerHidden, error } from '../style'

const hidden = {
  opacity: 0,
  'pointer-events': 'none'
}

const styles = $.css(
  Object.assign(
    {
      transition: 'opacity 100ms linear',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: 'auto',
      fill: '#fff',
      width: '3em',
      height: '3em',
      'z-index': '97',

      '& > button': {
        width: '100%',
        height: '100%',
        'border-radius': '100%',
        background: 'var(--primary-color)',
        opacity: 0.9,
        padding: '1em',

        '& > *': {
          position: 'relative',
          width: '1.5em',
          height: '1.5em',
          left: '-0.2em',
          top: '-0.25em'
        }
      },

      [`@global .${playing} &`]: hidden,
      [`@global .${loading} &`]: hidden,
      [`@global .${error} &`]: hidden
    },
    isMobile && {
      [`@global .${controllerHidden} &`]: hidden
    }
  )
)

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${styles}`,
    {},
    `<button aria-label="Play" class="${icon}" type="button">
      ${Icons.get('play')}
    </button>`
  )

  if (player.isNativeUI) {
    $dom.style.display = 'block'
    $dom.addEventListener('click', () => (player.play(), $dom.remove()), { once: true })
  } else {
    $dom.addEventListener('click', () => player.togglePlay())
  }

  $.render($dom, el)
}

export default render
