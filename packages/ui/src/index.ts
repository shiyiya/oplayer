import { $, isMobile } from '@oplayer/core'
import { root } from './style'

import { Icons, registerHotKey, registerSpeedSetting } from './functions'
import startListening from './listeners'

import renderController from './components/Controller'
import renderCoverButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoading from './components/Loading'
import renderMask from './components/Mask'
import renderMenubar from './components/Menubar'
import renderNotice from './components/Notice'
import renderSetting from './components/Setting'
import renderSubtitle from './components/Subtitle'

import {
  loading,
  playing,
  focused,
  fullscreen,
  webFullScreen,
  settingShown,
  controllerHidden
} from './style'

import type { Player, PlayerPlugin } from '@oplayer/core'
import type { UiConfig } from './types'

const apply = (player: Player, config: UiConfig) => {
  if (player.isNativeUI) {
    renderCoverButton(player, player.$root)
    return
  }

  const icons = Icons.setupIcons(player, config.icons)
  const $root = $.create(`div.${root(config)}`)
  startListening(player, config, $root)

  const error = renderError(player, $root, config)
  const notice = renderNotice(player, $root)
  renderLoading(player, $root)

  if (config.coverButton) renderCoverButton(player, $root)
  const { exp, cls, toggle } = renderController(player, $root, config)
  renderMask(player, $root, toggle)

  const setting = renderSetting(player, $root, config.settings)
  const menu = renderMenubar(player, $root, config.menu)
  const subtitle = renderSubtitle(player, setting, $root, config.subtitle)

  registerSpeedSetting(player, config.speed, setting)
  $.render($root, player.$root)

  if (!isMobile) registerHotKey(player)

  return {
    icons,
    error,
    notice,
    setting,
    menu,
    subtitle,
    ...exp,
    cls: {
      ...cls,
      loading,
      playing,
      focused,
      fullscreen,
      webFullScreen,
      settingShown,
      controllerHidden,
      root: $root.className
    }
  }
}

const defaultConfig: UiConfig = {
  hotkey: true,
  fullscreen: true,
  coverButton: true,
  miniProgressBar: true,
  pictureInPicture: true,
  settings: ['loop'],
  speed: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'],

  theme: { primaryColor: '#6668ab' }
}

const snow = (config?: UiConfig): PlayerPlugin => ({
  name: 'oplayer-theme-ui',
  key: 'ui',
  apply: (player) => apply(player, Object.assign(defaultConfig, config))
})

export default snow
