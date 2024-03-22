import Player, { PartialRequired, PlayerPlugin } from '@oplayer/core'
import type { ICONS_MAP } from './functions/icons'
import type { Subtitle as SubtitleInstance } from './components/Subtitle'

export type SubtitleSource = {
  default?: boolean
  name?: string
  src: string
  encoding?: string
  type?: string
  /**
   * seconds
   */
  offset?: number
}

export type Subtitle = {
  source?: SubtitleSource[]
  fontSize?: number
  bottom?: string
  color?: string
  shadow?: string
  fontFamily?: string
  background?: boolean
  marginBottom?: string
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
  children?: T[]
  onChange?: (arg: T, elm: HTMLButtonElement, player: Player) => void
  onClick?: (elm: HTMLButtonElement, player: Player) => void
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
  onChange?: (a: T /* Setting | boolean */, b?: { index: number; player: Player }) => void | Promise<void>
  default?: any
  value?: T
}

export type Thumbnails = {
  src: string[] | string
  number: number
  x?: number
  y?: number
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
    primaryColor?: string
    watermark?: {
      /** img or svg */
      src: string
      // make screenshot include watermark?
      // set positioning here [top, left, right, bottom]
      style?: Record<string, string>
      attrs?: Record<string, string>
    }

    progress?: {
      /**
       * default: 'auto'
       * auto: mobile->top pc->top
       */
      position?: 'auto' | 'top' | 'center'
      backward?: number
      forward?: number
      /**
       * default: true
       * work only top
       */
      mini?: boolean
    }

    controller?: {
      /**
       * default: 'always'
       */
      display?: 'always' | 'played'
      /**
       * default: false | only mobile
       */
      header?: boolean | { back?: 'always' | 'fullscreen' }
      /**
       * default: true
       */
      coverButton?: boolean
      /**
       * default: hover
       *
       */
      displayBehavior?: 'hover' | 'delay' | 'none'
      /**
       * default: 'none'
       */
      slideToSeek?: 'none' | 'always' | 'long-touch'
      /**
       * default: 'auto'
       * auto: mobile->top pc->top
       */
      setting?: 'auto' | 'top' | 'bottom'
    }
  }
  /**
   * default: false
   */
  autoFocus?: boolean

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
   *  default: true
   *  Whether or not the device should rotate to landscape mode when the video
   *  enters fullscreen.  Note that this behavior is based on an experimental
   *  browser API, and may not work on all platforms.
   *  Defaults to true.
   */
  forceLandscapeOnFullscreen?: boolean

  /**
   * PC only - default: { focused: true }
   */
  keyboard?: { focused?: boolean; global?: boolean }

  /**
   * default: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5']
   */
  speeds?: string[]

  subtitle?: Subtitle

  /**
   * default: ['loop', 'speed']
   */
  settings?: (Setting | 'loop')[] | false

  thumbnails?: Thumbnails

  highlight?: {
    color?: string
    source?: Highlight[]
  }

  menu?: MenuBar[]

  errorBuilder?: (error: ErrorPayload, target: HTMLDivElement, cb: (error: ErrorPayload) => void) => void

  icons?: {
    play?: string
    pause?: string
    volume?: [string, string] //on off
    fullscreen?: [string, string]
    pip?: [string, string]
    setting?: string
    screenshot?: string
    playbackRate?: string
    loop?: string
    progressIndicator?: string
    loadingIndicator?: string
    next?: string
    previous?: string
  }

  /*  --- WIP ---  */

  // contextmenu?: []
}

export type ErrorPayload =
  | Event
  | {
      message: string
      code?: number
    }

export interface UIInterface extends PlayerPlugin {
  config: PartialRequired<UiConfig, 'theme'>

  player: Player

  icons: typeof ICONS_MAP

  subtitle: SubtitleInstance

  $watermark?: HTMLImageElement

  notice: (
    text: string,
    position?:
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center'
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'left-bottom'
  ) => void

  keyboard?: {
    register: (payload: Record<string, (e: any) => void>) => void
    unregister: (keys: string[]) => void
  }

  setting?: {
    register: (payload: Setting | Setting[]) => void
    unregister: (key: string) => void
    updateLabel: (key: string, text: string) => void
    select: (key: string, value: boolean | number, shouldBeCallFn?: Boolean) => void
  }

  menu: {
    register: (menu: MenuBar) => void
    unregister: (key: string) => void
    select: (name: string, index: number) => void
  }

  toggleController: () => void

  changHighlightSource: (highlights: Highlight[]) => void

  changThumbnails: (src: Thumbnails) => void

  progressHoverCallback: ((rate?: number /** 0 ~ 1 */) => void)[]

  $root: HTMLDivElement

  $coverButton?: HTMLDivElement // 可配置无

  $controllerBar?: HTMLDivElement

  $controllerBottom: HTMLDivElement

  $progress?: HTMLDivElement //live 无

  $mask: HTMLDivElement

  $setting: HTMLDivElement

  $subtitle: HTMLDivElement
}
