import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import mepgts from '@oplayer/mpegts'

import Player from '@oplayer/core'

export default Player
export * from '@oplayer/core'

if (globalThis.window) {
  ;(globalThis.window as any).OUI = ui
  ;(globalThis.window as any).OHls = hls
  ;(globalThis.window as any).ODash = dash
  ;(globalThis.window as any).OMpegts = mepgts
}
