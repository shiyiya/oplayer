import type Player from '@oplayer/core'
import { loading } from '../style'
import { canplay } from '../utils'

const loadingListener = (player: Player) => {
  const addClass = () => player.$root.classList.add(loading)
  const removeClass = () => {
    if (!player.isSourceChanging) {
      player.$root.classList.remove(loading)
    }
  }

  if (player.$video.preload != 'none') {
    addClass()
  }

  player.on('loadstart', () => {
    if (player.$video.preload == 'none') removeClass()
  })

  player.on(['seeking', 'videoqualitychange', 'videosourcechange'], addClass)
  player.on(['canplaythrough', 'playing', 'pause', 'seeked', 'error'], removeClass)

  // safari 不预加载, 当 autoplay = true 才触发 canplay(预加载), 改变视频地址后默认预加载(或者是有用户交互?)
  // TODO: 尝试以下代码
  // if (isSafari && player.$video.autoplay) {
  //   player.once('loadedmetadata', () => player.$root.classList.remove(loading))
  // }
  // player.on('canplay', () =>
  //   player.$root.classList.remove(loading)
  // )

  player.on(player.$video.autoplay ? 'canplay' : canplay, () =>
    // 无视 isSourceChanging
    // 顺序: loadedmetadata -> ⬇(isSourceChanging: false) -> videosourcechanged(isSourceChanging: true)
    player.$root.classList.remove(loading)
  )

  player.on('waiting', () => {
    addClass()

    // Browsers may emit a timeupdate event after a waiting event. In order to prevent
    // premature removal of the waiting class, wait for the time to change.
    const timeWhenWaiting = player.currentTime
    const timeUpdateListener = () => {
      if (timeWhenWaiting !== player.currentTime) {
        removeClass()
        player.off('timeupdate', timeUpdateListener)
      }
    }

    player.on('timeupdate', timeUpdateListener)
  })
}

const isLoading = (player: Player) => player.$root.classList.contains(loading)

export { isLoading, loadingListener }
