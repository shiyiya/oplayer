import { Setting, UIInterface } from '../types'
import { Icons } from './icons'

const KEY = 'speed'

export default function registerSpeedSetting(it: UIInterface) {
  const {
    player,
    config: { speeds },
    setting
  } = it

  if (speeds?.length && setting) {
    setting.register(<Setting>{
      key: KEY,
      type: 'selector',
      name: player.locales.get('Speed'),
      icon: Icons.get('playbackRate'),
      children: speeds.map((speed) => ({
        name: +speed == 1 ? player.locales.get('Normal') : speed + 'x',
        value: +speed,
        default: player.playbackRate == +speed
      })),
      onChange: ({ value }) => player.setPlaybackRate(value)
    })

    player.on('ratechange', () => {
      const rate = player.playbackRate
      const i = speeds.findIndex((it) => +it == rate)

      if (i == -1) {
        setting.updateLabel(KEY, rate + 'x')
      } else {
        setting.select(KEY, i, false)
      }
    })
  }
}
