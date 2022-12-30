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
      this.off(name, once)
    }
    this.on(name, once)
  }

  off(name: string, callback: PlayerListener) {
    if (!this.events[name]) return
    const index = this.events[name]!.indexOf(callback)
    if (index > -1) {
      this.events[name]!.splice(index, 1)
    }
  }

  offAny(name: string) {
    this.events[name] = []
  }

  offAll() {
    this.events = Object.create(null)
  }

  emit(name: string, payload: any) {
    while (this.events[name] && this.events[name]!.length) {
      this.events[name]!.shift()!({ type: name, payload })
    }

    while (this.events['*'] && this.events['*']!.length) {
      this.events['*']!.shift()!({ type: name, payload })
    }
  }
}
