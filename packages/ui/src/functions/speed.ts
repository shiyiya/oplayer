import type { Player } from '@oplayer/core'
import { Setting, UiConfig } from '../types'
import speedSvg from '../icons/speed.svg?raw'

// TODO: listen playback change
export default function registerSpeedSetting(player: Player, speeds: UiConfig['speed']) {
  if (speeds?.length)
    player.registerSetting?.(<Setting>{
      name: player.locales.get('Speed'),
      type: 'selector',
      icon: speedSvg,
      key: 'speed',
      children: speeds.map((speed) => ({
        name: +speed == 1 ? 'Normal' : speed + 'x',
        value: +speed,
        type: 'switcher',
        default: player.playbackRate == +speed
      })),
      onChange: ({ value }) => player.setPlaybackRate(value)
    })
}
