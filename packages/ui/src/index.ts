import type Player from '@oplayer/core'
import { $, PlayerPlugin } from '@oplayer/core'
import { root } from './style'
import type { SnowConfig } from './types'

import renderControllerBar from './components/ControllerBar'
import renderButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoding from './components/Loading'
import renderMask from './components/Mask'
import renderNotice from './components/Notice'

import initListener from './listeners/init'
import { isMobile } from './utils'

const apply = (player: Player, config: SnowConfig) => {
  const $dom = $.create(`div.${root(config.theme)}`)

  // error
  renderError(player, $dom)

  // area
  const $area = $.create(`div.${$.css`width: 100%;height: 100%;`}`)
  renderLoding(player, $area)
  renderMask(player, $area)
  renderButton(player, $area)
  renderControllerBar(player, $area, config)
  renderNotice(player, $area)

  if (config.subtitle) {
    import('./components/Subtitle').then((h) => {
      h.default(player, $area, config)
    })
  }

  $.render($area, $dom)

  // root
  $.render($dom, player.$root)

  initListener.startListening(player)

  if (!isMobile) {
    import('./listeners/focus').then((h) => {
      h.default.startListening(player)
    })

    import('./functions/hotkey').then((h) => {
      h.default(player)
    })
  }
}

const defaultConfig: SnowConfig = {
  theme: {
    primaryColor: '#6668ab'
  },
  hotkey: true,
  speed: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'],
  fullscreen: true,
  fullscreenWeb: true,
  pictureInPicture: true,
  miniProgressBar: true
}

const snow = (config?: SnowConfig): PlayerPlugin => ({
  name: 'oplayer-theme-snow',
  apply: (player) => apply(player, Object.assign(defaultConfig, config))
})

export default snow
