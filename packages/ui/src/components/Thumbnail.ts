import { $ } from '@oplayer/core'
import type { Thumbnails, UIInterface } from '../types'
import { PartialRequired } from '@oplayer/core'

export const thumbnailCls = $.css(`
  position: absolute;
  left: 0;
  bottom: 12px;
  pointer-events: none;
  transform: translateX(-50%);
  background-position-y: center;
  border-radius: 2px;
  display: none;`)

export const vttThumbnailsCls = $.css(`
  position: absolute;
  left: 0;
  bottom: 12px;
  pointer-events: none;
  border-radius: 2px;
  display: none;`)

const defaultThumbnails = { width: 160, height: 90 }

export default function (it: UIInterface, container: HTMLElement) {
  const {
    config: { thumbnails: options },
    player
  } = it

  let isInitialized = false
  let thumbnails: PartialRequired<Thumbnails, 'width' | 'height'>
  const $dom = $.render($.create(`div.${thumbnailCls}`), container)

  function init(rate?: number) {
    if (!isInitialized || !rate) {
      isInitialized = true
      $dom.style.width = `${thumbnails.width}px`
      $dom.style.height = `${thumbnails.height}px`
      if (!Array.isArray(thumbnails.src)) $dom.style.backgroundImage = `url(${thumbnails.src})`
    } else {
      const [halfWidth, cw] = [thumbnails.width / 2, container.clientWidth]
      const [minRate, maxRate] = [halfWidth / cw, (cw - halfWidth) / cw]
      $dom.style.left = (rate < minRate ? minRate : rate > maxRate ? maxRate : rate) * 100 + '%'

      if (Array.isArray(thumbnails.src)) {
        // n*x * n*y
        const index = thumbnails.number * rate
        const srcIdx = Math.ceil(index / (thumbnails.x! * thumbnails.y!)) - 1

        const gridIdx = index % thumbnails.number
        const gridY = Math.floor(gridIdx / thumbnails.x!)
        const gridX = Math.ceil(gridIdx % thumbnails.x!)

        $dom.style.backgroundImage = `url(${thumbnails.src[srcIdx]})`
        $dom.style.backgroundPosition = `${-gridX}00% ${-gridY}00%`
      } else {
        // n*x 0*y
        const index = Math.floor(rate * thumbnails.number)
        $dom.style.backgroundPositionX = `-${index}00%`
      }
    }
  }

  function change(source: Thumbnails) {
    isInitialized = false
    thumbnails = Object.assign({}, defaultThumbnails, source)
    // n*x * n*y
    if (thumbnails.y && !Array.isArray(thumbnails.src)) {
      thumbnails.src = [thumbnails.src]
    }
    it.progressHoverCallback.push(init)
  }

  if (options?.src) change(options)

  player.on('videosourcechange', () => {
    isInitialized = false
    $dom.style.backgroundImage = 'none'

    it.progressHoverCallback.splice(
      it.progressHoverCallback.findIndex((it) => it == init),
      1
    )
  })

  it.changThumbnails = change
}
