export { EVENTS, VIDEO_EVENTS, PLAYER_EVENTS, OH_EVENTS } from './constants'
export { $, formatTime, isMobile, padZero } from './utils/index'

export { Player } from './player'
export { Player as default } from './player'

//TODO: Tree shaking
export { hlsPlugin } from './plugins/hls'
// export { torrentPlugin } from './plugins/torrent'

export type { Source, Options, PlayerPlugin, OplayerEvent, Listener } from './types'
