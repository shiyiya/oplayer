import * as Player from '@oplayer/core/src/constants'
import type { Setting, Subtitle } from './types'

//TODO: 扩展 PlayerEventName
// NEED PR

// declare global {
//   module '@oplayer/core' {
//     export * from '@oplayer/core'
//     interface Player {
//       readonly on: (
//         name:
//           | PlayerEventName
//           | PlayerListener
//           | 'ui:notice'
//           | 'ui:controllerchange'
//           | 'ui:subtitlechange' // Switch existing subtitles eg: switch Chinese subtitles to English subtitles
//           | 'ui:subtitleconfigchange' // Modify existing subtitles eg: Add English subtitles
//           | 'ui:settingloaded'
//           | 'ui:settingshow'
//           | 'ui:settinghide'
//           | 'ui:settingadd'
//           | 'ui:settingremove',
//         listener?: PlayerListener,
//         options?: { once: boolean }
//       ) => this
//     }
//   }
// }

declare module '@oplayer/core' {
  interface PlayerListeners extends Player.PlayerListeners {
    'notice': (event: 'notice', payload: { text: string }) => void
    'controllerchange': (event: 'controllerchange', payload: boolean) => void

    'settingshow': (event: 'settingshow') => void
    'settinghide': (event: 'settinghide') => void
    'settingchange': (event: 'settingchange', payload: Setting) => void
    'settingremove': (event: 'settinghide', payload: string) => void
    'settingloaded': (event: 'settingloaded') => void

    'subtitleshow': (event: 'subtitleshow') => void
    'subtitlehide': (event: 'subtitlehide') => void
    'subtitlechange': (event: 'subtitlechange', payload: Subtitle[]) => void
  }
}
