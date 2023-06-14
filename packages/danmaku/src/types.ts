import type Danmaku from 'danmaku'

export type Options = {
  source: string | Function | Comment[]
  /**
   * @default:144
   * */
  speed?: number
  opacity?: number
  fontSize?: number
  /**
   * @default: 0.8
   * */
  area?: number
  /**
   * @default: true
   * */
  heatmap?: boolean | Array<[number, number]>
  /**
   * @default 'dom'
   */
  engine?: 'canvas' | 'dom'
  /**
   * @default true
   */
  enable?: boolean
  /**
   * @default false
   * PC only
   */
  displaySender?: boolean

  onEmit?: (comment: Comment) => boolean | void
}

export interface Comment {
  text?: string
  /**
   * @default rtl
   */
  mode?: 'ltr' | 'rtl' | 'top' | 'bottom'
  /**
   * Specified in seconds. Not required in live mode.
   * @default media?.currentTime
   */
  time?: number
  style?: Partial<CSSStyleDeclaration> | CanvasRenderingContext2D
  /**
   * A custom render to draw comment.
   * When it exist, `text` and `style` will be ignored.
   */
  render?(): HTMLElement | HTMLCanvasElement
}

export interface DanmakuContext extends Danmaku {
  comments: Comment[]
  heatmap?: {
    enable: () => void
    disable: () => void
  }
  bootstrap: (source: Options['source']) => Promise<void>
  setFontSize: (size: number) => void
}
