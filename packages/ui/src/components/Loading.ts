import type { Player } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { line, loading, wrap } from './Loading.style'

const render = (_: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${wrap}`,
    {},
    `<div class=${loading}>
      <div class="${line}"></div>
    </div>
    `
  )

  $.render($dom, el)
}

export default render
