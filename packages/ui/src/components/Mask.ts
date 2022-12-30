import type Player from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
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

const render = (player: Player, el: HTMLElement, toggleController: Function) => {
  const $dom = $.create(`div.${maskCls}`)
  let count = 0
  let timeoutId: number

  $dom.addEventListener('click', () => {
    if (hasClass(player.$root, settingShown)) return
    if (isMobile) {
      toggleController()
    } else {
      //pc 双击全屏
      if (count == 0) player.togglePlay()
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        if (count == 2) player.toggleFullScreen()
        count = 0
      }, 200)
    }

    count += 1
  })

  return $.render($dom, el)
}

export default render
