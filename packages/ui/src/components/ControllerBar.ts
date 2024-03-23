import { $, isMobile } from '@oplayer/core'

import type { UIInterface } from '../types'
import { controllerHidden, hidden } from '../style'
import { controllers, dropdown, expand, withIcon } from './ControllerBottom.style'
import { arrowSvg } from './Setting'

export const controlBar = $.css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  'z-index': 7,
  padding: '0.5em 0.5em 0',
  transition: 'transform 0.3s ease',
  height: 'var(--control-bar-height)',

  // https://developer.mozilla.org/zh-CN/docs/Web/CSS/env
  //TODO: support display-mode
  // '@media (display-mode: fullscreen)': {
  //   'padding-top': 'constant(safe-area-inset-top)',
  // },

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

  '& > div:nth-child(1)': { overflow: 'hidden', flex: '1 1 0', 'margin-right': '0.5em' },

  [`& > div:nth-child(2) .${dropdown}:last-child .${expand}`]: {
    right: 'max(50%,3em)'
  },

  [`@global .${controllerHidden} &`]: {
    transform: 'translateY(calc(-100%))',
    '&::before': { opacity: 0 }
  }
})

const controlBarBackIcon = $.css('width: 2.5em;height: 2.5em;margin:0 -10px;transform: rotate(180deg);')

const controlBarTitle = $.css(
  'flex:1;font-size:1em;margin: 0 0.25em;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;'
)

const render = (it: UIInterface, el: HTMLDivElement) => {
  const { player, config } = it
  const header = config.theme.controller?.header

  if (!header) return

  const back = (header as any)?.back
  const backEnabled = back && isMobile

  const $dom = (it.$controllerBar = $.create(
    'div',
    {
      class: `${controlBar} ${controllers}`
    },
    `<div class="${withIcon}">
    ${
      backEnabled
        ? `<span role='button' class="${controlBarBackIcon} ${back == 'fullscreen' ? hidden : ''}">${arrowSvg(
            ''
          )}</span>`
        : ''
    }
      <h2 class='${controlBarTitle}'>${player.options?.source?.title || ''}</h2>
    </div>
    <div class="${withIcon}"></div>`
  ))

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
          $controlBarBack.classList.remove(hidden)
        } else {
          $controlBarBack.classList.add(hidden)
        }
      })
    }
  }

  player.on('videosourcechanged', ({ payload }) => {
    $controlBarTitle.innerText = payload.title || ''
  })

  $.render($dom, el)
}

export default render
