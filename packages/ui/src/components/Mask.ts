import { $ } from '@oplayer/core'
import type Player from '@oplayer/core'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `<div class=${$.css`
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;`}></div>`
  )

  $dom.addEventListener('click', () => {
    player.togglePlay()
  })

  $.render($dom, el)
}

export default render
