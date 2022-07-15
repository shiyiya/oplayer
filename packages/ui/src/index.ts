import { $, PlayerPlugin } from '@oplayer/core'
import type Player from '@oplayer/core'
import type { SnowConfig } from './types'
import { root } from './style'

import renderError from './components/Error'
import renderLoding from './components/Loading'
import renderMask from './components/Mask'
import renderButton from './components/CoverButton'
import renderControllerBar from './components/ControllerBar'

const apply = (player: Player, config: SnowConfig) => {
  const $dom = $.create(`div.${root(config.theme)}`)
  const $area = $.create(`div.${$.css`width: 100%;height: 100%;`}`)

  // error
  renderError(player, $dom)

  // area
  $.render($area, $dom)
  renderLoding(player, $area)
  renderMask(player, $area)
  renderButton(player, $area)
  renderControllerBar(player, $area, config)

  // root
  $.render($dom, player.$root)
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
