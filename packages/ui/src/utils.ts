import Player from '@oplayer/core'

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

export const isMobile = /Android|webOS|iPhone|Pad|Pod|BlackBerry|Windows Phone/i.test(
  navigator.userAgent
)

export function download(url: string, name: string) {
  const $a = document.createElement('a')
  $a.href = url
  $a.download = name
  $a.click()
}

export const resolveVideoDataURL = ($video: HTMLVideoElement): string | Error => {
  try {
    const $canvas = document.createElement('canvas')
    $canvas.width = $video.videoWidth
    $canvas.height = $video.videoHeight
    $canvas.getContext('2d')?.drawImage($video, 0, 0)
    return $canvas.toDataURL('image/png')
  } catch (error) {
    return error as Error
  }
}

export const screenShot = (player: Player) => {
  const { $video, isLoaded } = player
  if (!isLoaded) return

  const resp = resolveVideoDataURL($video)
  if (resp instanceof Error) {
    player.emit('notice', { text: resp.message })
  } else {
    download(resp, `${formatTime(player.currentTime).replace(/:/g, '-')}-OPlayer-ScreenShot.png`)
  }
}

export const debounce = (fn: () => void, ms: number = 1500) => {
  let time: NodeJS.Timeout | null = null
  return () => {
    time && clearTimeout(time)
    time = setTimeout(() => {
      fn()
    }, ms)
  }
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
  target.classList.toggle(className)
  return target
}

export function hasClass(target: HTMLElement, className: string) {
  return target.classList.contains(className)
}

export const DRAG_EVENT_MAP = {
  dragStart: isMobile ? 'touchstart' : 'mousedown',
  dragMove: isMobile ? 'touchmove' : 'mousemove',
  dragEnd: isMobile ? 'touchend' : 'mouseup'
} as const

export const hexToRgb = (hex: string) =>
  hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    ?.map((x) => parseInt(x, 16))
