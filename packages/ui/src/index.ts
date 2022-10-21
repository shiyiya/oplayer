import { $, isMobile } from '@oplayer/core'
import { root } from './style'

import { Icons, registerHotKey, registerSpeedSetting } from './functions'
import { focusListener, initListener, loadingListener, playingListener } from './listeners'

import renderControllerBar from './components/ControllerBar'
import renderCoverButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoading from './components/Loading'
import renderMask from './components/Mask'
import renderMenubar from './components/Menubar'
import renderNotice from './components/Notice'
import renderSetting from './components/Setting'
import renderSubtitle from './components/Subtitle'

import type { Player, PlayerPlugin } from '@oplayer/core'
import type { UiConfig } from './types'

const apply = (player: Player, config: UiConfig) => {
  if (player.evil()) {
    renderCoverButton(player, player.$root)
    return
  }

  initListener(player)
  playingListener(player)
  loadingListener(player)

  if (!isMobile) {
    focusListener(player, config.autoFocus)
    registerHotKey(player)
  }

  Icons.setupIcons(player, config.icons)

  const $frag = document.createDocumentFragment() as unknown as HTMLDivElement
  const $root = $.create(`div.${root(config.theme)}`)

  renderError(player, $frag, config)
  renderNotice(player, $frag)
  renderLoading(player, $frag)
  renderCoverButton(player, $frag)
  renderMask(player, $frag, renderControllerBar(player, $frag, config))

  renderSetting(player, $frag, config.settings)
  renderMenubar(player, $frag, config.menu)

  registerSpeedSetting(player, config.speed)
  renderSubtitle(player, $frag, config.subtitle)

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
