import { UIInterface } from '../types'

export const render = (it: UIInterface, config: UIInterface['config']) => {
  const watermark = config.theme.watermark
  if (!watermark) return

  const wm = (it.$watermark = document.createElement('img'))
  wm.setAttribute('alt', 'watermark')

  for (const key in watermark.style) {
    wm.style[key as any] = watermark.style[key]!
  }

  for (const key in watermark.attrs) {
    wm.setAttribute(key, watermark.attrs[key]!)
  }

  wm.src = watermark.src
  it.$root.appendChild(wm)
}
