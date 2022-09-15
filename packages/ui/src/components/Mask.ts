import type Player from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import initListener from '../listeners/init'
import { settingShown } from '../style'
import { hasClass } from '../utils'

export const maskCls = $.css({
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',

  [`@global .${settingShown} &`]: {
    'z-index': '98'
  }
})

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(`div.${maskCls}`)

  $dom.addEventListener('click', () => {
    if (!initListener.isInitialized() || hasClass(player.$root, settingShown)) return
    if (isMobile) {
      player.emit('controllervisibilitychange')
    } else {
      player.togglePlay()
    }
  })

  $.render($dom, el)
}

export default render
