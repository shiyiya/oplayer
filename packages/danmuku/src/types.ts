export type DanmukuItem = {
  text: string
  time: number
  mode?: number
  fontSize: number
  color?: string
  timestamp: number
  pool: number
  userID: string
  rowID: number
  border?: string
}

export type QueueItem = DanmukuItem & {
  status: 'wait' | 'emit' | 'ready' | 'stop'
  $ref: HTMLDivElement | null
  restTime: number
  lastTime: number
}

export type DanmukuPosition = {
  target: {
    mode: number
    height: number
    speed: number
  }
  emits: {
    top: number
    left: number
    right: number
    height: number
    width: number
    speed: number
    distance: number
    time?: number
    mode?: number
  }[]
  clientWidth: number
  clientHeight: number
  marginBottom: number
  marginTop: number
  antiOverlap: boolean
}

export type Options = {
  danmuku: string | Function | DanmukuItem[]
  speed: number // 持续时间 秒，[1 ~ 10]
  opacity: number // 透明度 [0 ~ 1]
  fontSize?: number // 字体大小
  color: string // 默认字体颜色
  /**
   * 0 scroll
   * 1 static
   */
  mode: 0 | 1
  margin: [number, number] // 上下边距，
  antiOverlap: boolean // 是否防重叠
  useWorker: boolean // 是否使用 web worker
  synchronousPlayback: false // 是否同步到播放速度
  filter: (danmuku: DanmukuItem) => boolean // 过滤
}
