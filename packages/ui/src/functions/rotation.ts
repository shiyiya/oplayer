import { Player, isIOS } from '@oplayer/core'
import type { UiConfig } from '../types'

export default function registerFullScreenRotation(player: Player, config: UiConfig) {
  if (config.forceLandscapeOnFullscreen && !isIOS) {
    const enterFullScreen_ = player.enterFullscreen
    const exitFullscreen_ = player.exitFullscreen

    Object.defineProperties(player, {
      enterFullscreen: {
        get() {
          return async () => {
            try {
              await enterFullScreen_.call(player)
              screen.orientation?.lock('landscape')
            } catch (error) {}
          }
        }
      },
      exitFullscreen: {
        get() {
          return async () => {
            try {
              await exitFullscreen_.call(player)
              screen.orientation?.unlock()
            } catch (error) {}
          }
        }
      }
    })
  }
}
