export type SubtitleSource = {
  default?: boolean
  name?: string
  src: string
  encoding?: string
  type?: string
}

export type Subtitle = {
  source: SubtitleSource[]
  fontSize?: number
  enabled?: boolean
  bottom?: string
  color?: string
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
}

export type Highlight = {
  text: string
  time: number
}

export type UiConfig = {
  theme?: {
    primaryColor: `#${string}`
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
   * default: false
   */
  fullscreenWeb?: boolean
  /**
   * default: true
   */
  pictureInPicture?: boolean
  /**
   * default: true
   */
  miniProgressBar?: boolean

  subtitle?: Subtitle

  settings?: Setting[]

  thumbnails?: Thumbnails

  highlight?: Highlight[]

  /*  --- WIP ---  */

  contextmenu?: []

  airplay?: boolean
}
