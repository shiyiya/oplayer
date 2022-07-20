import { EVENTS, VIDEO_EVENTS, PLAYER_EVENTS, OH_EVENTS } from './constants'
import { formatTime, isMobile, padZero } from './utils/index'
import { $ } from './utils/dom'
import { Player } from './player'

export default Object.assign(Player, {
  EVENTS,
  VIDEO_EVENTS,
  PLAYER_EVENTS,
  OH_EVENTS,
  formatTime,
  isMobile,
  padZero,
  $
})
