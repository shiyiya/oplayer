export function padZero(time: number): string {
  return time < 10 ? `0${time}` : `${time}`
}

export function formatTime(duration: number): string {
  const h = Math.floor(duration / 3600)
  const m = Math.floor((duration % 3600) / 60)
  const s = Math.floor((duration % 3600) % 60)
  return `${h > 0 ? `${padZero(h)}:` : ''}${padZero(m)}:${padZero(s)}`
}
