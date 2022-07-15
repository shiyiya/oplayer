import { $ } from '@oplayer/core'
import type Player from '@oplayer/core'

const render = (player: Player, el: HTMLElement) => {
  $.create(
    `<div class=${$.css`
      position: absolute;
      inset: 0;
      font-color: #fff;
      font-size: 1.2em;
`}></div>`
  )
}

export default render
