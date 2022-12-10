export type Options = {
  source: string | Function | Comment[]
  speed?: number // 持续时间 秒，[1 ~ 10]
  opacity?: number
  fontSize?: number
  engine: 'canvas' | 'dom'
  enable?: boolean //default true
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
