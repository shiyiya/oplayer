import { $ } from '@oplayer/core'
import type { Highlight, UIInterface } from '../types'

export const highlightTextCls = $.css(`
  display: none;
  bottom: 15px;
  position: absolute;
  left: 50%;
  padding: 6px 8px;
  background-color: var(--shadow-background-color);
  color: #fff;
  border-radius: 2px;
  white-space: nowrap;
  word-break: nowrap;
  transform: translateX(-50%);`)

export const highlightCls = $.css({
  position: 'absolute',
  width: '0.8em',
  height: '0.33em',
  'background-color': 'var(--highlight-color)',
  transform: 'translateX(-3px)',
  transition: 'all 0.2s',

  [`&:hover > .${highlightTextCls}`]: {
    display: 'block'
  }
})

export default function (it: UIInterface, container: HTMLElement) {
  const {
    player,
    config: { highlight: highlightsConfig }
  } = it

  let $highlights: HTMLDivElement[] = []

  container.style.setProperty('--highlight-color', highlightsConfig?.color || '#FFF')

  function createDto(options: { left: number; text: string }) {
    const dto = $.create(`div.${highlightCls}`, {}, `<span class="${highlightTextCls}">${options.text}</san>`)
    dto.style.left = `${options.left}%`
    return dto
  }

  function createHighlights(highlights: Highlight[], duration: number) {
    $highlights.forEach((it) => it.remove())
    for (let i = 0; i < highlights.length; i++) {
      const h = highlights[i]!
      const $highlight = createDto({ left: (h.time / duration) * 100, text: h.text })
      $highlights.push($highlight)
      $.render($highlight, container)
    }
  }

  function change(highlights: Highlight[]) {
    bootstrap(highlights)
  }

  function bootstrap(highlights: Highlight[]) {
    if (player.duration !== Infinity && player.duration > 0) {
      createHighlights(highlights, player.duration)
    } else {
      player.once('loadedmetadata', function durationchange() {
        createHighlights(highlights, player.duration)
      })
    }
  }

  if (highlightsConfig?.source) bootstrap(highlightsConfig.source)

  player.on('videosourcechange', () => {
    $highlights.forEach((it) => it.remove())
    $highlights = []
  })

  it.changHighlightSource = change
}
