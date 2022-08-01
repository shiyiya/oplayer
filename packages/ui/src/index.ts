import type Player from '@oplayer/core'
import { $, PlayerPlugin } from '@oplayer/core'
import { root } from './style'
import type { SnowConfig } from './types'

import renderControllerBar from './components/ControllerBar'
import renderButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoding from './components/Loading'
import { initListener } from './utils'

const apply = (player: Player, config: SnowConfig) => {
  const $dom = $.create(`div.${root(config.theme)}`)
  const $area = $.create(`div.${$.css`width: 100%;height: 100%;`}`)

  // error
  renderError(player, $dom)

  // area
  $.render($area, $dom)
  renderLoding(player, $area)
  renderButton(player, $area)
  renderControllerBar(player, $area, config)

  // root
  $.render($dom, player.$root)

  initListener.startListening(player)
}

const defaultConfig: SnowConfig = {
  theme: {
    primaryColor: '#6668ab'
  },
  speed: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'],
  disableFullscreen: false,
  disablePictureInPicture: false
}

const snow = (config?: SnowConfig): PlayerPlugin => ({
  name: 'oplayer-theme-snow',
  apply: (player) => apply(player, Object.assign(defaultConfig, config))
})

export default snow
