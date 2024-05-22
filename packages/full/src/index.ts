import { Player, $, isMobile, isiPad, isiPhone, isIOS, isQQBrowser, loadSDK } from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import mepgts from '@oplayer/mpegts'

const OPlayer = Object.assign(Player, {
  $,
  isMobile,
  isiPad,
  isiPhone,
  isIOS,
  isQQBrowser,
  loadSDK
})

export default OPlayer

if (globalThis.window) {
  ;(globalThis.window as any).OUI = ui
  ;(globalThis.window as any).OHls = hls
  ;(globalThis.window as any).ODash = dash
  ;(globalThis.window as any).OMpegts = mepgts
}
