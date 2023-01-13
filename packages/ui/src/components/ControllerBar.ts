import { $, isMobile } from '@oplayer/core'

import type { Player } from '@oplayer/core'
import type { UiConfig } from '../types'
import { controllerHidden } from '../style'
import { controllerBottom } from './ControllerBottom.style'
import { arrowSvg } from './Setting'

export const controlBar = $.css({
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  'z-index': 97,
  padding: '0.5em 1em',
  height: 'auto',
  transition: 'transform 0.3s ease',

  '&::before': {
    position: 'absolute',
    content: "''",
    width: '100%',
    display: 'block',
    top: 0,
    left: 0,
    bottom: '-1em',
    'z-index': -1,
    transition: 'opacity 0.3s ease',
    'pointer-events': 'none',
    'background-image': 'linear-gradient(rgba(0, 0, 0, .3), transparent)'
  },

  '& > div:nth-child(1)': { cursor: 'pointer', overflow: 'hidden' },

  [`@global .${controllerHidden} &`]: {
    transform: 'translateY(calc(-100%))',
    '&::before': { opacity: 0 }
  }
})

const controlBarTitle = $.css(
  'font-size:1.25em;margin: 0 0.25em;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;'
)

const controlBarBackIcon = $.css(
  `width: 2em;
   height: 2em;
   scale: 1.2;
   margin: 4px -4px 0 -8px;
   transform: rotate(180deg);`
)

const hiddenBack = $.css('display:none')

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  if (!config.controlBar) return {}
  const back = config.controlBar?.back
  const backEnabled = back && isMobile
  const $dom = $.create(
    'div',
    {
      class: `${controlBar} ${controllerBottom}`
    },
    `<div>
      <span role='button' class="${back == 'fullscreen' ? hiddenBack : ''}">${
      backEnabled ? arrowSvg(controlBarBackIcon) : ''
    }</span>
      <h2 class='${controlBarTitle}'>${player.options?.source?.title}</h2>
    </div>
    <div></div>`
  )

  const $controlBarTitle = $dom.querySelector<HTMLElement>(`.${controlBarTitle}`)!

  if (backEnabled) {
    const $controlBarBack = $controlBarTitle.previousElementSibling!

    $controlBarBack.addEventListener('click', (e) => {
      if (player.isFullScreen) player.exitFullscreen()
      player.emit('backward', e)
    })

    if (back == 'fullscreen') {
      player.on('fullscreenchange', () => {
        if (player.isFullScreen) {
          $controlBarBack.classList.remove(hiddenBack)
        } else {
          $controlBarBack.classList.remove(hiddenBack)
        }
      })
    }
  }

  player.on('videosourcechanged', ({ payload }) => {
    $controlBarTitle.innerText = payload.title || ''
  })

  $.render($dom, el)

  return { cls: { controlBar } }
}

export default render
