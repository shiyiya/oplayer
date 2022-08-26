import type Player from '@oplayer/core'
import { $, PlayerPlugin } from '@oplayer/core'
import { root } from './style'
import type { UiConfig } from './types'

import renderControllerBar from './components/ControllerBar'
import renderCoverButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoding from './components/Loading'
import renderMask from './components/Mask'
import renderNotice from './components/Notice'
import renderSetting from './components/Setting'

import initListener from './listeners/init'
import { isMobile } from './utils'

const apply = (player: Player, config: UiConfig) => {
  const $frag = document.createDocumentFragment() as unknown as HTMLDivElement
  const $root = $.create(`div.${root(config.theme)}`)

  // error
  renderError(player, $frag)

  // area
  renderLoding(player, $frag)
  renderMask(player, $frag)
  const { show, hide } = renderCoverButton(player, $frag)
  renderControllerBar(player, $frag, config, show, hide)
  renderSetting(player, $frag, config.settings)
  renderNotice(player, $frag)

  if (config.subtitle) {
    import('./components/Subtitle').then((h) => {
      h.default(player, $frag, config)
    })
  }

  if (!isMobile) {
    import('./listeners/focus').then((h) => {
      h.default.startListening(player, config.autoFocus)
    })

    import('./functions/hotkey').then((h) => {
      h.default(player)
    })
  }

  initListener.startListening(player)

  $.render($frag, $root)
  $.render($root, player.$root)
}

const defaultConfig: UiConfig = {
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

const snow = (config?: UiConfig): PlayerPlugin => ({
  name: 'oplayer-theme-ui',
  apply: (player) => apply(player, Object.assign(defaultConfig, config))
})

export default snow
