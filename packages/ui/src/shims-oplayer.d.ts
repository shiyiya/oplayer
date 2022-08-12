// import { PlayerEventName, PlayerListener } from '@oplayer/core/src/types'

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

// declare module '@oplayer/core' {
//   interface Player {
//     readonly on: (
//       name:
//         | PlayerEventName
//         | PlayerListener
//         | 'ui:notice'
//         | 'ui:controllerchange'
//         | 'ui:subtitlechange' // Switch existing subtitles eg: switch Chinese subtitles to English subtitles
//         | 'ui:subtitleconfigchange' // Modify existing subtitles eg: Add English subtitles
//         | 'ui:settingloaded'
//         | 'ui:settingshow'
//         | 'ui:settinghide'
//         | 'ui:settingadd'
//         | 'ui:settingremove',
//       listener?: PlayerListener,
//       options?: { once: boolean }
//     ) => this
//   }
// }
