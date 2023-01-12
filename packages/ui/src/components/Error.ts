import type { Player, PlayerEvent } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { error } from '../style'
import { ErrorPayload, UiConfig } from '../types'
import { addClass, removeClass } from '../utils'

const errorCls = $.css(`
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: #fff;
  background: #000;
  z-index: 97;
  align-items: center;
  padding: 0 10px;
  word-break: break-all;
  justify-content: center;
`)

const showCls = $.css('display: flex;')

const VIDEO_ERROR_MAP = {
  1: 'MEDIA_ERR_ABORTED',
  2: 'MEDIA_ERR_NETWORK',
  3: 'MEDIA_ERR_DECODE',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
}

const render = (player: Player, el: HTMLElement, config: UiConfig) => {
  if (config.errorBuilder) {
    player.on('error', ({ payload }: PlayerEvent) => {
      config.errorBuilder!(payload)
    })
    return
  }

  const $dom = $.render($.create(`div.${errorCls}`, { 'aria-label': 'Error Overlay' }), el)

  function show(payload: ErrorPayload) {
    let message = ''

    if (payload instanceof Event) {
      //@ts-ignore
      const error = payload.target?.error as {
        message: string
        code: keyof typeof VIDEO_ERROR_MAP
      } | null

      // err==null || err= {message:'',code:undefined}
      if (!error || (!error.message && typeof error.code != 'number')) {
        return
      }

      message = error.message || VIDEO_ERROR_MAP[error.code]
    } else {
      message = payload.message
    }

    $dom.innerText = message || 'UNKNOWN_ERROR'
    player.$root.classList.add(error)
    addClass($dom, showCls)
  }

  function clear() {
    removeClass($dom, showCls)
    player.$root.classList.remove(error)
    $dom.innerText = ''
  }

  player.on(['videosourcechange', 'videoqualitychange'], clear)
  player.on('error', ({ payload }) => show(payload))

  return show
}

export default render
