import { $ } from '@oplayer/core'
import { Thumbnails } from '../types'

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
  const chunk = 100 / options.number
  let minRate = 0,
    maxRate = 0

  setTimeout(() => {
    minRate = 80 / container.clientWidth
    maxRate = (container.clientWidth - 80) / container.clientWidth
  })

  return {
    update: (rate: number) => {
      if (!isImgLoaded) {
        isImgLoaded = true
        $dom.style.backgroundImage = `url(${options.url})`
      }

      $dom.style.display = 'block'
      $dom.style.left = (rate < minRate ? minRate : rate > maxRate ? maxRate : rate) * 100 + '%'
      const index = ~~((rate * 100) / chunk) * options.number * chunk
      $dom.style.backgroundPositionX = `${index}%`
    },
    hide: () => {
      $dom.style.display = 'none'
    }
  }
}
