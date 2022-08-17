import * as Player from '@oplayer/core/src/constants'
import type { Setting, Subtitle } from './types'

declare module '@oplayer/core' {
  interface PlayerListeners extends Player.PlayerListeners {
    notice: (event: 'notice', payload: { text: string }) => void
    controllerchange: (event: 'controllerchange', payload: boolean) => void

    settingshow: (event: 'settingshow') => void
    settinghide: (event: 'settinghide') => void
    settingchange: (event: 'settingchange', payload: Setting) => void
    settingremove: (event: 'settinghide', payload: string) => void
    settingloaded: (event: 'settingloaded') => void

    subtitleshow: (event: 'subtitleshow') => void
    subtitlehide: (event: 'subtitlehide') => void
    subtitlechange: (event: 'subtitlechange', payload: Subtitle[]) => void
  }
}
