import Player, { $ } from '@oplayer/core'
import type { Highlight } from '../types'

export const highlightTextCls = $.css(`
  display: none;
  bottom: 15px;
  position: absolute;
  left: 50%;
  padding: 5px 8px;
  background-color: var(--shadow-background-color);
  color: #fff;
  border-radius: 4px;
  white-space: nowrap;
  word-break: nowrap;
  transform: translateX(-50%);`)

export const highlightCls = $.css({
  position: 'absolute',
  width: '6px',
  height: '4px',
  'border-radius': '1px',
  'background-color': '#fff',
  transform: 'translateX(-3px)',
  transition: 'all 0.2s',

  [`&:hover > .${highlightTextCls}`]: {
    display: 'block'
  }
})

export default function (player: Player, container: HTMLElement, highlights: Highlight[] = []) {
  const $dom = document.createDocumentFragment() as unknown as HTMLDivElement
  let $highlights: HTMLDivElement[] = []
  let active = true

  function createDto(options: { left: number; text: string }) {
    const dto = $.create(
      `div.${highlightCls}`,
      {},
      `<span class="${highlightTextCls}">${options.text}</san>`
    )
    dto.style.left = `${options.left}%`
    return dto
  }

  function createHighlights(highlights: Highlight[], duration: number) {
    for (let i = 0; i < highlights.length; i++) {
      const h = highlights[i]!
      const $highlight = createDto({ left: (h.time / duration) * 100, text: h.text })
      $highlights.push($highlight)
      $.render($highlight, $dom)
    }
    $.render($dom, container)
  }

  player.on('videoinitialized', () => {
    if (active) createHighlights(highlights, player.duration)
  })

  player.on('videosourcechange', () => {
    active = false
    $highlights.forEach((it) => it.remove())
  })

  player.on('highlightchange', () => {
    active = true
    $highlights.forEach((it) => it.remove())
    createHighlights(highlights, player.duration)
  })
}
