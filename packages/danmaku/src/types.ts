export type Options = {
  source: string | Function | Comment[]
  /**
   * @default:144
   * */
  speed?: number
  opacity?: number
  fontSize?: number
  /**
   * @default 'dom'
   */
  engine: 'canvas' | 'dom'
  /**
   * @default true
   */
  enable?: boolean
  /**
   * TODO: 换个名字
   * @default false
   */
  withSendDom?: boolean

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
