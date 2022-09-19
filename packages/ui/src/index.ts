import type Player from '@oplayer/core'
import { $, PlayerPlugin, isMobile } from '@oplayer/core'
import { root } from './style'
import type { UiConfig } from './types'

import renderControllerBar from './components/ControllerBar'
import renderCoverButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoading from './components/Loading'
import renderMask from './components/Mask'
import renderNotice from './components/Notice'
import renderSetting from './components/Setting'
import renderSubtitle from './components/Subtitle'

import registerSpeedSetting from './functions/speed'
import registerHotKey from './functions/hotkey'

import focusListener from './listeners/focus'
import initListener from './listeners/init'

const apply = (player: Player, config: UiConfig) => {
  if (player.evil()) {
    renderCoverButton(player, player.$root)
    return
  }

  const $frag = document.createDocumentFragment() as unknown as HTMLDivElement
  const $root = $.create(`div.${root(config.theme)}`)

  renderError(player, $frag)
  renderNotice(player, $frag)
  renderLoading(player, $frag)
  renderMask(player, $frag)

  const { show, hide } = renderCoverButton(player, $frag) as any
  renderControllerBar(player, $frag, config, show, hide)

  renderSetting(player, $frag, config.settings)

  registerSpeedSetting(player, config.speed)

  if (config.subtitle) {
    renderSubtitle(player, $frag, config.subtitle)
  }

  if (!isMobile) {
    focusListener.startListening(player, config.autoFocus)
    registerHotKey(player)
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
  pictureInPicture: true,
  miniProgressBar: true
}

const snow = (config?: UiConfig): PlayerPlugin => ({
  name: 'oplayer-theme-ui',
  apply: (player) => apply(player, Object.assign(defaultConfig, config))
})

export default snow
