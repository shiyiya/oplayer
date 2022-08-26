import { $ } from '@oplayer/core'
import { Thumbnails } from '../types'

export interface ThumbnailOptions {
  startSecond?: number
  gapSecond?: number
  row?: number
  col?: number
  width?: number
  height?: number
  images?: string[]
}

export interface ThumbImg {
  url: string
  x: number
  y: number
}

const noop = () => {}

export default function (container: HTMLElement, options?: Thumbnails) {
  if (!options) return { update: noop, hide: noop }

  const $dom = $.create(
    `div.${$.css(`
      position: absolute;
      left: 0;
      bottom: 12px;
      pointer-events: none;
      transform: translateX(-50%);
      background-position-y: center;
      display: none;
      width: 160px;
      height: 90px;
     `)}`
  )

  $.render($dom, container)

  let isImgLoaded = false
  const chunk = options.number / 100

  return {
    update: (rate: number) => {
      if (!isImgLoaded) {
        isImgLoaded = true
        $dom.style.backgroundImage = `url(${options.url})`
      }

      const maxleft = container.clientWidth - 80,
        maxRate = maxleft / container.clientWidth,
        minRate = 80 / container.clientWidth

      $dom.style.display = 'block'
      $dom.style.left = (rate < minRate ? minRate : rate > maxRate ? maxRate : rate) * 100 + '%'
      const index = ~~((rate * 100) / chunk) * chunk
      $dom.style.backgroundPositionX = `${index}%`
    },
    hide: () => {
      $dom.style.display = 'none'
    }
  }
}
