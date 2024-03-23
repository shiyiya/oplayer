import { Player, isIOS, isMobile } from '@oplayer/core'
import type { UiConfig } from '../types'

export default function registerFullScreenRotation(player: Player, config: UiConfig) {
  if (config.forceLandscapeOnFullscreen && !isIOS && isMobile) {
    player.on('fullscreenchange', ({ payload }) => {
      if (payload.isWeb || !player._requestFullscreen) return
      if (player.isFullScreen) {
        // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1615
        ;(globalThis.screen.orientation as any)?.lock?.('landscape')
      } else {
        globalThis.screen.orientation?.unlock?.()
      }
    })
  }
}
