import { EVENTS, OH_EVENTS, PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import { Player } from './player'
import { $ } from './utils/dom'
import { isIOS, isIpad, isMobile } from './utils/platform'

export default Object.assign(Player, {
  $,
  isIOS,
  isIpad,
  isMobile,

  EVENTS,
  OH_EVENTS,
  VIDEO_EVENTS,
  PLAYER_EVENTS
})
