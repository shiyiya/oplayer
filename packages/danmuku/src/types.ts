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

// https://commentcorelibrary.readthedocs.io/en/latest/data-formats/bilibili-xml/#_1
// stime: 弹幕出现时间 (s)
// mode: 弹幕类型 (< 7 时为普通弹幕)
// size: 字号
// color: 文字颜色
// date: 发送时间戳
// pool: 弹幕池ID
// author: 发送者ID
// dbid: 数据库记录ID（单调递增）

export type Option = {
  danmuku: string | Function | DanmukuItem[]
  speed: number // 持续时间 秒，[1 ~ 10]
  opacity: number // 透明度 [0 ~ 1]
  fontSize?: number // 字体大小
  color: '#FFFFFF' // 默认字体颜色
  mode: 0 | 1 // 0-滚动，1-静止
  margin: [number, number] // 上下边距，
  antiOverlap: true // 是否防重叠
  useWorker: true // 是否使用 web worker
  synchronousPlayback: false // 是否同步到播放速度
  max: number // 同屏密度
  filter: (danmuku: DanmukuItem) => boolean // 过滤
}
