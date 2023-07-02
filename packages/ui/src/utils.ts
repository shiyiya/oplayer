import type Player from '@oplayer/core'
import { isMobile } from '@oplayer/core'
import { isLoading } from './listeners'
import type { UIInterface } from './types'

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function padZero(time: number): string {
  return time < 10 ? `0${time}` : `${time}`
}

export function formatTime(duration: number): string {
  if (!isFinite(duration)) return '--:--'
  const h = Math.floor(duration / 3600)
  const m = Math.floor((duration % 3600) / 60)
  const s = Math.floor((duration % 3600) % 60)
  return `${h > 0 ? `${padZero(h)}:` : ''}${padZero(m)}:${padZero(s)}`
}

export function download(url: string, name: string) {
  const $a = document.createElement('a')
  $a.href = url
  $a.download = name
  $a.click()
}

export const resolveVideoAndWatermarkDataURL = (player: Player): string | Error => {
  try {
    const { $video, $root } = player
    const ui = player.context.ui as UIInterface
    const $canvas = document.createElement('canvas')
    const { videoWidth, videoHeight } = $video
    $canvas.width = videoWidth
    $canvas.height = videoHeight
    $canvas.getContext('2d')!.drawImage($video, 0, 0, videoWidth, videoHeight)
    const { top, left, right, bottom } = ui.$watermark?.style || {}

    if (ui.$watermark && [top, left, right, bottom].filter((it) => it != undefined).length > 1) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = ui.$watermark
      const { width, height } = ui.$watermark.getBoundingClientRect()
      let dx = 0,
        dy = 0

      if (left) {
        dx = offsetLeft
      } else if (right) {
        const offsetRight = $root.clientWidth - offsetLeft - offsetWidth
        dx = videoWidth - offsetRight - offsetWidth
      }

      if (top) {
        dy = offsetTop
      } else if (bottom) {
        const offsetBottom = $root.clientHeight - offsetTop - offsetHeight
        dy = videoWidth - offsetBottom - offsetHeight
      }

      $canvas.getContext('2d')!.drawImage(ui.$watermark, dx, dy, width, height)
    }

    return $canvas.toDataURL('image/png')
  } catch (error) {
    return error as Error
  }
}

export const screenShot = (player: Player) => {
  if (isLoading(player) || isNaN(player.duration)) {
    player.emit('notice', { text: player.locales.get('Please wait for loading to complete') })
    return
  }
  const resp = resolveVideoAndWatermarkDataURL(player)
  if (resp instanceof Error) {
    player.emit('notice', { text: resp.message })
  } else {
    const title = player.options.source.title || 'OPlayer-ScreenShot'
    download(resp, `${title}-${formatTime(player.currentTime).replace(/:/g, '-')}.png`)
  }
}

export const debounce = (fn: () => void, ms: number = 1500) => {
  let time: ReturnType<typeof setTimeout> | null = null
  const clear = () => time && clearTimeout(time)
  const callee = () => {
    clear()
    time = setTimeout(() => {
      fn()
    }, ms)
  }
  return { callee, clear }
}

export const siblings = (el: HTMLElement, cb?: (el: HTMLElement) => void) => {
  var nodes = []
  var children = el.parentNode!.children
  for (let i = 0, len = children.length; i < len; i++) {
    if (children[i] !== el) {
      cb?.(<HTMLElement>children[i])
      nodes.push(children[i])
    }
  }
  return nodes
}

export function addClass(target: HTMLElement, className: string) {
  target.classList.add(className)
  return target
}

export function removeClass(target: HTMLElement, className: string) {
  target.classList.remove(className)
  return target
}

export function toggleClass(target: HTMLElement, className: string) {
  return target.classList.toggle(className)
}

export function hasClass(target: HTMLElement, className: string) {
  return target.classList.contains(className)
}

export const DRAG_EVENT_MAP = {
  dragStart: isMobile ? 'touchstart' : 'mousedown',
  dragMove: isMobile ? 'touchmove' : 'mousemove',
  dragEnd: isMobile ? 'touchend' : 'mouseup'
} as const

// export const hexToRgb = (hex: string) =>
//   hex
//     .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => '#' + r + r + g + g + b + b)
//     .substring(1)
//     .match(/.{2}/g)
//     ?.map((x) => parseInt(x, 16))
