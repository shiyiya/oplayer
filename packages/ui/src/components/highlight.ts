import Player, { $ } from '@oplayer/core'
import type { Highlight } from '../types'

export const highlightTextCls = $.css(`
  display: none;
  z-index: 2;
  bottom: 10px;
  position: absolute;
  left: 50%;
  padding: 5px 8px;
  background-color: var(--shadow-background-color);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  word-break: nowrap;
  transform: translateX(-50%);`)

export const highlightCls = $.css({
  position: 'absolute',
  top: '4.5px',
  width: '6px',
  height: '3px',
  'border-radius': '2px',
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

  player.on('durationchange', () => {
    if (player.duration !== Infinity && player.duration > 0)
      createHighlights(highlights, player.duration)
  })

  player.on('videosourcechange', () => {
    $highlights.forEach((it) => it.remove())
  })
}
