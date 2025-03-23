import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import mepgts from '@oplayer/mpegts'
import torrent from '@oplayer/torrent'
import shaka from '@oplayer/shaka'

import Player from '@oplayer/core'

export default Player
export * from '@oplayer/core'

if (globalThis.window) {
  ;(globalThis.window as any).OUI = ui
  ;(globalThis.window as any).OHls = hls
  ;(globalThis.window as any).ODash = dash
  ;(globalThis.window as any).OMpegts = mepgts
  ;(globalThis.window as any).OTorrent = torrent
  ;(globalThis.window as any).OShaka = shaka
}
