import type { Player, PlayerEvent } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { addClass, removeClass } from '../utils'

const showCls = $.css('display: flex !important;')

const errorCls = $.css(`
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  color: #fff;
  font-size: 1em;
  background: #000;
  z-index: 99;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
  -moz-user-select: text;
  -webkit-user-select: text;
  -ms-user-select: text;
  user-select: text;
`)

const VIDEO_ERROR_MAP = {
  1: 'MEDIA_ERR_ABORTED',
  2: 'MEDIA_ERR_NETWORK',
  3: 'MEDIA_ERR_DECODE',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
}

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(`div.${errorCls}`, { 'aria-label': 'Error Overlay' })

  player.on(['error', 'pluginerror'], ({ payload }: PlayerEvent) => {
    addClass($dom, showCls)

    let message: string = payload.message
    if (payload instanceof Error) {
      message = payload.message
    } else if (payload instanceof Event) {
      // @ts-ignore
      message = (payload.currentTarget?.error as Error)?.message

      //@ts-ignore
      if (!message && payload.target?.error?.code) {
        message =
          //@ts-ignore
          VIDEO_ERROR_MAP[payload.currentTarget?.error?.code as keyof typeof VIDEO_ERROR_MAP]
      }
    }

    $dom.innerText = message || 'UNKNOWN_ERROR ' + (payload.target?.error?.code || '')
  })

  player.on('videosourcechange', () => {
    removeClass($dom, showCls)
    $dom.innerText = ''
  })

  $.render($dom, el)
}

export default render
