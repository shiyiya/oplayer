import Player, { $ } from '@oplayer/core'
import type { Thumbnails } from '../types'

const noop = () => {}

export const thumbnailCls = $.css(`
  position: absolute;
  left: 0;
  bottom: 12px;
  pointer-events: none;
  transform: translateX(-50%);
  background-position-y: center;
  border-radius: 3px;
  display: none;`)

const defaultThumbnails = { width: 160, height: 90 }

export default function (player: Player, container: HTMLElement, options?: Thumbnails) {
  if (!options) return { update: noop, hide: noop, init: noop }

  let isInitialized = false
  let thumbnails = Object.assign(defaultThumbnails, options)
  const $dom = $.render($.create(`div.${thumbnailCls}`), container)

  function init() {
    if (!isInitialized) {
      isInitialized = true
      $dom.style.width = `${thumbnails.width}px`
      $dom.style.height = `${thumbnails.height}px`
      $dom.style.backgroundImage = `url(${thumbnails.src})`
    }
  }

  function change(source: Thumbnails) {
    isInitialized = false
    thumbnails = Object.assign(defaultThumbnails, source)
  }

  player.on('videosourcechange', () => {
    isInitialized = false
    $dom.style.backgroundImage = 'none'
  })

  return {
    init,
    update: (rate: number) => {
      if (!isInitialized) return
      const [halfWidth, cw] = [thumbnails.width / 2, container.clientWidth]
      const [minRate, maxRate] = [halfWidth / cw, (cw - halfWidth) / cw]
      $dom.style.left = (rate < minRate ? minRate : rate > maxRate ? maxRate : rate) * 100 + '%'
      const index = ~~(rate * 100) * thumbnails.number
      $dom.style.backgroundPositionX = `${-index}%`
    },
    change
  }
}
