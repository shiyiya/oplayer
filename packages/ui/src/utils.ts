import type { Player } from '@oplayer/core'

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

export const initListener = (() => {
  let isInit = false
  let before = <Function[]>[]
  let after = <Function[]>[]

  const initStart = () => {
    isInit = false
    before.forEach((f) => f())
  }

  const initEnd = () => {
    if (isInit) return
    isInit = true
    after.forEach((f) => f())
  }

  return {
    isInit: () => isInit,
    startListening: function listener(player: Player) {
      initStart()
      // https://www.cnblogs.com/taoze/p/5783928.html
      if (isMobile) {
        player.on('durationchange', function durationchange() {
          if (
            player.duration !== 1 &&
            player.duration !== Infinity &&
            player.duration != NaN &&
            player.duration > 1
          ) {
            initEnd()
            player.off('durationchange', durationchange)
          }
        })
      } else {
        player.on('canplaythrough', initEnd)
      }

      player.on('videosourcechange', initStart)
    },
    add: (be: Function, af: Function) => {
      before.push(be)
      after.push(af)
    }
  }
})()
