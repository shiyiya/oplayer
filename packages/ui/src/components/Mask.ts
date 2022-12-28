import type Player from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { settingShown } from '../style'
import { formatTime, hasClass } from '../utils'

export const maskCls = $.css({
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',

  [`@global .${settingShown} &`]: {
    'z-index': '98'
  }
})

const render = (player: Player, el: HTMLElement, toggleController: Function) => {
  const $dom = $.create(`div.${maskCls}`)
  let count = 0
  let timeoutId: number

  $dom.addEventListener('click', () => {
    if (hasClass(player.$root, settingShown)) return

    if (count == 0) {
      if (isMobile) {
        toggleController()
      } else {
        player.togglePlay()
      }
    }

    count += 1
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      if (count == 2) {
        player.toggleFullScreen()
      }
      count = 0
    }, 200)
  })

  if (isMobile) {
    let touchedTime = 0
    let touchStartPointerX = 0
    let shouldSeekSec = 0
    const rect = player.$root.getBoundingClientRect()
    $dom.oncontextmenu = () => false

    const moving = (e: TouchEvent) => {
      e.preventDefault()
      const x = (<TouchEvent>e).changedTouches[0]!.clientX - rect.left
      // const y = (<TouchEvent>e).changedTouches[0]!.clientX - rect.top
      const distance = x - touchStartPointerX
      const distancePercent = distance / rect.width
      shouldSeekSec = 60 * distancePercent

      player.emit('notice', {
        text: `${formatTime(
          minmax(player.currentTime + shouldSeekSec, [0, player.duration])
        )} / ${formatTime(player.duration)}`
      })
    }

    $dom.addEventListener('touchstart', (e) => {
      touchStartPointerX = (<TouchEvent>e).changedTouches[0]!.clientX
      const id = setInterval(() => {
        touchedTime += 100
        if (touchedTime >= 1000) {
          clearInterval(id)
          //左右滑动可以调整进度
          player.emit('notice', { text: 'slid left or right to seek' })
          $dom.addEventListener('touchmove', moving)
        }
      }, 100)

      $dom.addEventListener(
        'touchend',
        () => {
          id && clearInterval(id)
          $dom.removeEventListener('touchmove', moving)
          player.seek(minmax(player.currentTime + shouldSeekSec, [0, player.duration]))
          touchStartPointerX = shouldSeekSec = touchedTime = 0
        },
        { once: true }
      )
    })
  }

  $.render($dom, el)
}

function minmax(value: number, range: [number, number]) {
  return Math.min(Math.max(value, range[0]), range[1])
}

export default render
