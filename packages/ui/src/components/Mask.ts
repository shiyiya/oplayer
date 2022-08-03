import { $ } from '@oplayer/core'
import type Player from '@oplayer/core'
import { isMobile } from '../utils'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;`}`
  )

  $dom.addEventListener('click', () => {
    if (isMobile) {
      player.emit('ui/controller:toggle')
    } else {
      player.togglePlay()
    }
  })

  $.render($dom, el)
}

export default render
