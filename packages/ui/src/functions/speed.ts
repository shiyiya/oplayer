import type { Player } from '@oplayer/core'
import { Setting, UiConfig } from '../types'
import speedSvg from '../icons/speed.svg?raw'

// TODO: listen playback change
export default function registerSpeedSetting(player: Player, speeds: UiConfig['speed']) {
  if (speeds?.length)
    player.emit('addsetting', <Setting>{
      name: player.locales.get('Playback speed'),
      type: 'selector',
      icon: speedSvg,
      key: 'speed',
      children: speeds.map((speed) => ({
        name: +speed == 1 ? 'Normal' : speed + 'x',
        value: +speed,
        type: 'switcher',
        default: player.playbackRate == +speed
      })),
      onChange: ({ value }, { isInit }: any) => {
        console.log(1)

        if (!isInit) player.setPlaybackRate(value)
      }
    })
}
