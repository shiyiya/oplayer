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

  return {
    isInit: () => isInit,
    listener: function listener(player: Player, before: Function, after: Function) {
      isInit = false
      before()

      const init = () => {
        isInit = true
        after()
      }

      // https://www.cnblogs.com/taoze/p/5783928.html
      if (isMobile) {
        player.on('durationchange', function durationchange() {
          if (
            player.duration !== 1 &&
            player.duration !== Infinity &&
            player.duration != NaN &&
            player.duration > 1
          ) {
            init()
            player.off('durationchange', durationchange)
          }
        })
      } else {
        player.on('canplaythrough', init, { once: true })
      }

      player.on('videosourcechange', function next() {
        player.off('videosourcechange', next)
        listener(player, before, after)
      })
    }
  }
})()
