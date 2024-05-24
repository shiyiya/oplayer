import { Player } from '@oplayer/core'
import ui from './index'

export default Player
export * from '@oplayer/core'

if (globalThis.window) {
  ;(<any>globalThis.window).OUI = ui
}
