import { Player, isIOS, isMobile } from '@oplayer/core'
import type { UiConfig } from '../types'

export default function registerFullScreenRotation(player: Player, config: UiConfig) {
  if (config.forceLandscapeOnFullscreen && !isIOS && isMobile) {
    player.on('fullscreenchange', ({ payload }) => {
      if (payload.isWeb) return
      if (player.isFullScreen) {
        screen.orientation?.lock('landscape')
      } else {
        screen.orientation?.unlock()
      }
    })
  }
}
