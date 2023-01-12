export type SubtitleSource = {
  default?: boolean
  name?: string
  src: string
  encoding?: string
  type?: string
}

export type Subtitle = {
  source?: SubtitleSource[]
  fontSize?: number
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
  position?: 'top' | 'bottom'
  name: string
  icon?: string
  children: T[]
  onChange: (arg: T, elm: HTMLButtonElement) => void
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
   * PC only - default: { focused: true }
   */
  keyboard?: { focused?: boolean; global?: boolean }
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
   * 全屏（如果不可用将会降级为网页全屏）
   */
  fullscreen?: boolean
  /**
   * default: false
   */
  pictureInPicture?: boolean
  /**
   * default: true
   */
  miniProgressBar?: boolean

  /**
   * default: true
   */
  coverButton?: boolean

  /**
   * default: 'always'
   */
  showControls?: 'always' | 'played'

  /**
   * default: 'none'
   */
  slideToSeek?: 'none' | 'always' | 'long-touch'

  /**
   *  default: true
   *  Whether or not the device should rotate to landscape mode when the video
   *  enters fullscreen.  Note that this behavior is based on an experimental
   *  browser API, and may not work on all platforms.
   *  Defaults to true.
   */
  forceLandscapeOnFullscreen?: boolean

  subtitle?: Subtitle
  /**
   * default: ['loop']
   */
  settings?: (Setting | 'loop')[]

  /**
   * default: false
   */
  controlBar?: boolean

  /**
   * default: false
   * required -> controlBar: true
   */
  topSetting?: boolean

  thumbnails?: Thumbnails

  highlight?: {
    color?: string
    source?: Highlight[]
  }

  menu?: MenuBar[]

  errorBuilder?: (error: Error | Event | { code: number; message: string }) => void

  icons?: {
    play?: string
    pause?: string
    volume?: [string, string] //on off
    fullscreen?: [string, string]
    pip?: string
    setting?: string
    screenshot?: string
    playbackRate?: string
    loop?: string
    progressIndicator?: string
    loadingIndicator?: string
  }

  /*  --- WIP ---  */

  contextmenu?: []

  layers?: any[]
}

export type ErrorPayload =
  | Event
  | {
      message: string
      code?: number
    }
