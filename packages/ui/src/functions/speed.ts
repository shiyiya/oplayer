import type { Player } from '@oplayer/core'
import { Setting, UiConfig } from '../types'
import { Icons } from './icons'

// TODO: listen playback change
export default function registerSpeedSetting(player: Player, speeds: UiConfig['speed']) {
  if (speeds?.length)
    player.emit('addsetting', <Setting>{
      name: player.locales.get('Speed'),
      type: 'selector',
      icon: Icons.get('playbackRate'),
      key: 'speed',
      children: speeds.map((speed) => ({
        name: +speed == 1 ? 'Normal' : speed + 'x',
        value: +speed,
        default: player.playbackRate == +speed
      })),
      onChange: ({ value }) => player.setPlaybackRate(value)
    })
}
