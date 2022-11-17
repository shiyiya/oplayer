import type Player from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { Icons } from '../functions/icons'

import { icon, playing, loading, controllerHidden, initialized } from '../style'

const styles = $.css(
  Object.assign(
    {
      '& > button': {
        position: 'absolute',
        right: '40px',
        bottom: '5em',
        fill: '#fff',
        width: '4.5em',
        'z-index': '97',

        '& > svg': Object.assign(
          {
            filter: 'drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3))'
          },
          isMobile && {
            '&:nth-child(1)': { display: 'block' },
            '&:nth-child(2)': { display: 'none' },

            [`@global .${playing} &`]: {
              '&:nth-child(1)': { display: 'none' },
              '&:nth-child(2)': { display: 'block' }
            }
          }
        )
      },

      '@media only screen and (max-width: 991px)': {
        '& > button': {
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
          margin: 'auto',
          width: '3.5em',
          height: '3.5em'
        }
      }
    },
    isMobile
      ? {
          display: 'none',
          [`@global .${initialized} &`]: { display: 'block' },
          [`@global .${controllerHidden} &`]: { display: 'none' }
        }
      : {
          [`@global .${loading} &`]: { display: 'none' },
          [`@global .${playing} &`]: { display: 'none' }
        }
  )
)

const render = (player: Player, el: HTMLElement) => {
  const needPause = !player.evil() && isMobile
  const $dom = $.create(
    `div.${styles}`,
    {},
    `<button aria-label="Play" class="${icon}" type="button">
      ${Icons.get('play')}
      ${needPause ? Icons.get('pause') : ''}
    </button>`
  )

  if (player.evil()) {
    $dom.style.display = 'block'
    $dom.addEventListener('click', () => (player.play(), $dom.remove()), { once: true })
  } else {
    $dom.addEventListener('click', () => player.togglePlay())
  }

  $.render($dom, el)
}

export default render
