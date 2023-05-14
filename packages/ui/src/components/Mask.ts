import { $, isMobile } from '@oplayer/core'
import { settingShown } from '../style'
import { UIInterface } from '../types'
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
    'z-index': '8'
  }
})

const render = (it: UIInterface) => {
  const { player, $root: el } = it

  const $dom = (it.$mask = $.create(`div.${maskCls}`))
  let count = 0
  let timeoutId: number

  $dom.addEventListener('click', () => {
    if (hasClass(player.$root, settingShown)) {
      return
    }

    if (isMobile) {
      it.toggleController()
    } else {
      //pc 双击全屏
      if (count == 0) player.togglePlay()
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        if (count == 2) {
          player.togglePlay()
          player.toggleFullScreen()
        }
        count = 0
      }, 200)
    }

    count += 1
  })

  $.render($dom, el)
}

export default render
