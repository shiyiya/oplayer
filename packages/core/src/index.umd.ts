import { EVENTS, OH_EVENTS, PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import { Player } from './player'
import { $ } from './utils/dom'
import * as platform from './utils/platform'
import * as utils from './utils/index'
import * as script from './utils/script'

export default Object.assign(
  Player,
  {
    $,

    EVENTS,
    OH_EVENTS,
    VIDEO_EVENTS,
    PLAYER_EVENTS
  },

  utils,
  platform,
  script
)
