import type { Player, PlayerEvent } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { addClass, removeClass } from '../utils'

const showCls = $.css('display: flex !important;')

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      display: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      color: #fff;
      font-size: 1em;
      background: #000;
      z-index: 99;
      justify-content: center;
      align-items: center;
      padding: 0 10px;
      `}`,
    { 'aria-label': 'Errror Overlay' }
  )

  player.on(['error', 'pluginerror'], ({ payload }: PlayerEvent) => {
    addClass($dom, showCls)

    let message: string = payload.message
    if (payload instanceof Error) {
      message = payload.message
    } else if (payload instanceof Event) {
      // @ts-ignore
      message = (payload.target?.error as Error)?.message
    }

    $dom.innerText = message || 'UNKNOWN_ERROR ' + payload.target?.error.code
  })

  player.on('videosourcechange', () => {
    removeClass($dom, showCls)
    $dom.innerText = ''
  })

  $.render($dom, el)
}

export default render
