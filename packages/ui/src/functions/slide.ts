import { UIInterface } from '../types'
import { isMobile } from '@oplayer/core'
import { clamp, formatTime, hasClass } from '../utils'
import { settingShown } from '../style'

const FULL_SLIDE_DURATION = 60

export default function (it: UIInterface) {
  const {
    player,
    config: { theme },
    $mask: $dom
  } = it

  const slideToSeek = theme.controller?.slideToSeek

  if (isMobile && !player.options.isLive && slideToSeek && slideToSeek != 'none') {
    player.once('loadedmetadata', () => {
      let startX = 0
      let startY = 0
      let touchedTime = 0
      let shouldSeekSec = 0
      let touchedTimer: number
      const rect = player.$root.getBoundingClientRect()

      if (slideToSeek == 'always') {
        $dom.addEventListener('touchstart', (e) => {
          if (hasClass(player.$root, settingShown)) return
          const { clientX, clientY } = e.changedTouches[0]!
          ;[startX, startY] = [clientX, clientY]
        })
        $dom.addEventListener('touchmove', moving)
        $dom.addEventListener('touchend', end)
      }

      if (slideToSeek == 'long-touch') {
        $dom.addEventListener('touchstart', (e) => {
          if (hasClass(player.$root, settingShown)) return
          const { clientX, clientY } = e.changedTouches[0]!
          ;[startX, startY] = [clientX, clientY]
          touchedTimer = window.setInterval(() => {
            touchedTime += 100
            if (touchedTime >= 1000) {
              clearInterval(touchedTimer)
              //左右滑动可以调整进度
              player.emit('notice', { text: 'slid left or right to seek', pos: 'top' })
              $dom.addEventListener('touchmove', moving)
            }
          }, 100)

          $dom.addEventListener('touchend', end, { once: true })
        })
      }

      function moving(e: TouchEvent) {
        if (startX == 0 && startY == 0) return
        const { clientX, clientY } = e.changedTouches[0]!
        const [dx, dy] = [clientX - startX, startY - clientY]
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return

        const angle = getSlideAngle(dx, dy)
        if (
          (angle >= -45 && angle < 45) ||
          (angle >= 135 && angle <= 180) ||
          (angle >= -180 && angle < -135)
        ) {
          e.preventDefault()
          shouldSeekSec = (FULL_SLIDE_DURATION * dx) / rect.width

          player.emit('notice', {
            text: `${formatTime(
              clamp(player.currentTime + shouldSeekSec, 0, player.duration)
            )} / ${formatTime(player.duration)}`,
            pos: 'top'
          })
        }
      }

      function end() {
        if (startX == 0 && startY == 0) return
        if (slideToSeek == 'long-touch' && touchedTime < 1000) {
          if (touchedTimer) clearInterval(touchedTimer)
          $dom.removeEventListener('touchmove', moving)
        }
        if (Math.abs(shouldSeekSec) >= 1) {
          player.seek(clamp(player.currentTime + shouldSeekSec, 0, player.duration))
        }
        startX = startY = shouldSeekSec = touchedTime = 0
      }
    })
  }
}

function getSlideAngle(dx: number, dy: number) {
  return (Math.atan2(dy, dx) * 180) / Math.PI
}
