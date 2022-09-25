import { Player } from '@oplayer/core'
import { Setting, MenuBar, SubtitleSource, Thumbnails } from './types'

declare module '@oplayer/core' {
  export interface Player {
    registerSetting: (setting: Setting | Setting[]) => void
    unRegisterSetting: (key: string) => void
    selectSetting: (key: string, value: boolean | number) => void
    updateSettingLabel: (key: string, text: string) => void

    registerMenu: (menu: MenuBar) => void
    unRegisterMenu: (key: string) => void
    selectMenu: (key: string, value: boolean | number) => void

    registerHotKey: (map: { key: string; fn: Function }[]) => void
    unRegisterHotKey: (key: string[]) => void

    changeSubtitleSource: (source: SubtitleSource[]) => void
    changeThumbnailsSource: (src: string) => void
  }
}
