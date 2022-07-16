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

  player.on('error', (e) => {
    $dom.style.display = 'flex'
    $dom.innerText = e.payload.message || 'Unknown Error'
  })

  player.on('videosourcechange', () => {
    $dom.style.display = 'none'
    $dom.innerText = ''
  })

  $.render($dom, el)
}

export default render
