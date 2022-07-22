import { $ } from '@oplayer/core'
import type Player from '@oplayer/core'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      display: none;
      position: absolute;
      inset: 0;
      color: #fff;
      font-size: 1.5em;
      background: #000;
      z-index: 99;
      justify-content: center;
      align-items: center;
      `}`
  )

  const MediaError = [
    'UNKNOWN_ERROR',
    'MEDIA_ERR_ABORTED',
    'MEDIA_ERR_NETWORK',
    'MEDIA_ERR_DECODE',
    'MEDIA_ERR_SRC_NOT_SUPPORTED'
  ]

  player.on('error', (e) => {
    $dom.style.display = 'flex'
    const code = e.payload.target?.error?.code
    // native media error | custom error | unknown error
    $dom.innerText = code ? MediaError[code] : e.payload.message || 'Unknown Error'
  })

  player.on('videosourcechange', () => {
    $dom.style.display = 'none'
    $dom.innerText = ''
  })

  $.render($dom, el)
}

export default render
