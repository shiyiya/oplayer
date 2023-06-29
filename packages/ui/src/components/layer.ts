import { UIInterface, UiConfig } from '../types'

export const render = (it: UIInterface, config: UiConfig) => {
  const watermark = config.theme?.watermark
  if (!watermark) return

  const wm = (it.$watermark = document.createElement('img'))

  for (const key in watermark.style) {
    if (Object.prototype.hasOwnProperty.call(watermark.style, key)) {
      wm.style[key as any] = watermark.style[key]!
    }
  }

  if (watermark.className) wm.className = watermark.className
  wm.src = watermark.src
  it.$root.appendChild(wm)
}
