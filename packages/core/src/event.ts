import type { PlayerListener, PlayerEvent } from './types'

export default class EventEmitter {
  events: Record<string, PlayerListener[]> = Object.create(null)

  on(name: string, callback: PlayerListener) {
    if (!this.events[name]) {
      this.events[name] = []
    }
    this.events[name]!.push(callback)
  }

  onAny(names: string[], callback: PlayerListener) {
    names.forEach((name) => this.on(name, callback))
  }

  once(name: string, callback: PlayerListener) {
    const once = (event: PlayerEvent) => {
      callback({ type: name, payload: event.payload })
    }
    once.raw = callback
    this.on(name, once)
  }

  off(name: string, callback: PlayerListener) {
    if (!this.events[name]) return

    for (let i = 0; i < this.events[name]!.length; i++) {
      const queue = this.events[name]![i]
      //@ts-ignore
      if (queue == callback || callback == queue.raw) {
        this.events[name]!.splice(i, 1) // TODO: fix 一边 emit（循环） 一边 off（删除） 错误
      }
    }
  }

  offAny(name: string) {
    this.events[name] = []
  }

  offAll() {
    this.events = Object.create(null)
  }

  emit(name: string, payload?: any) {
    const onceOffQueue: any[] = []
    this.events[name]?.forEach((callback) => {
      callback({ type: name, payload })
      //@ts-ignore
      if (callback.raw) onceOffQueue.push(callback)
    })

    this.events['*']?.forEach((callback) => {
      callback({ type: name, payload })
      //@ts-ignore
      if (callback.raw) onceOffQueue.push(callback)
    })

    onceOffQueue.forEach((it) => {
      this.off(name, it)
    })
  }
}
