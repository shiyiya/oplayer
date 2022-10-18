import type { Player } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { line, wrap } from './Loading.style'

const render = (_: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${wrap}`,
    { 'aria-label': 'Loading' },
    `<div class="${line}"></div>
    `
  )

  $.render($dom, el)
}

export default render
