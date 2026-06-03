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

    const queue = this.events[name]!
    for (let i = queue.length - 1; i >= 0; i--) {
      //@ts-ignore
      if (queue[i] == callback || callback == queue[i]?.raw) {
        queue.splice(i, 1)
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
    // Clone the arrays to avoid mutation during iteration (off() may modify the array)
    const listeners = this.events[name]?.slice() ?? []
    const wildcardListeners = this.events['*']?.slice() ?? []

    listeners.forEach((callback) => {
      callback({ type: name, payload })
      //@ts-ignore
      if (callback.raw) onceOffQueue.push(callback)
    })

    wildcardListeners.forEach((callback) => {
      callback({ type: name, payload })
      //@ts-ignore
      if (callback.raw) onceOffQueue.push(callback)
    })

    onceOffQueue.forEach((it) => {
      this.off(name, it)
    })
  }
}
