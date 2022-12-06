export type SubtitleSource = {
  default?: boolean
  name?: string
  src: string
  encoding?: string
  type?: string
}

export type Subtitle = {
  source: SubtitleSource[]
  fontSize?: number | string
  bottom?: string
  color?: string
  shadow?: string
  fontFamily?: string
}

export type MenuBar<
  T = {
    name: string
    default?: boolean
    value?: any
  }
> = {
  name: string
  icon?: string
  children: T[]
  onChange: (arg: T) => void
  onClick?: (elm: HTMLButtonElement) => void
}

export type Setting<T = any> = {
  name: string
  key?: string // children 可无 （用于移除）
  /**
   * selector 切换下个面板单选 1 ｜ 2 ｜ 3
   * switcher  当前面板切换 true or false
   */
  type: 'selector' | 'switcher'
  icon?: string
  children?: Setting[]
  onChange?: (a: T /* Setting | boolean */, b?: { index: number }) => void | Promise<void>
  default?: any
  value?: T
}

export type Thumbnails = {
  src: string
  number: number
  width?: number
  height?: number
  isVTT?: boolean
}

export type Highlight = {
  text: string
  time: number
}

export type UiConfig = {
  theme?: {
    primaryColor: string
  }
  /**
   * default: false
   */
  autoFocus?: boolean
  /**
   * default: true
   */
  hotkey?: boolean
  /**
   * default: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5']
   */
  speed?: string[]
  /**
   * default: false
   */
  screenshot?: boolean
  /**
   * default: true
   */
  fullscreen?: boolean
  /**
   * default: true
   */
  pictureInPicture?: boolean
  /**
   * default: true
   */
  miniProgressBar?: boolean

  subtitle?: Subtitle
  /**
   * default: ['loop']
   */
  settings?: (Setting | 'loop')[]

  thumbnails?: Thumbnails

  highlight?: Highlight[]

  menu?: MenuBar[]

  errorBuilder?: (error: Error | Event | { code: number; message: string }) => void

  icons?: {
    play: string
    pause: string
    volume: [string, string] //on off
    fullscreen: [string, string]
    pip: string
    setting: string
    screenshot: string
    playbackRate: string
    loop: string
    progressIndicator: string
    loadingIndicator: string
  }

  /*  --- WIP ---  */

  contextmenu?: []
}

export type ErrorPayload =
  | Event
  | {
      message: string
      code?: number
    }

export type UIMethods = {
  error: (text: string) => void
  notice: (text: string) => void
  setting: {}
  menu: {}
  subtitle: {}
  highlight: {}
  thumbnails: {}
}
