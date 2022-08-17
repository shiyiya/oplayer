import type { PlayerListeners } from './constants'

export default class EventEmitter {
  events: Record<keyof PlayerListeners, PlayerListeners[keyof PlayerListeners][]> =
    Object.create(null)

  on<E extends keyof PlayerListeners>(name: E, callback: PlayerListeners[E]) {
    if (!this.events[name]) {
      this.events[name] = [] as any
    }
    this.events[name]!.push(callback)
  }

  onAny<E extends keyof PlayerListeners>(names: E[], callback: PlayerListeners[E]) {
    names.forEach((name) => this.on(name, callback))
  }

  once<E extends keyof PlayerListeners>(name: E, callback: PlayerListeners[E]) {
    const once: any = (name: any, payload: any) => {
      callback(name as never, payload)
      this.off(name, once)
    }
    this.on(name, once)
  }

  off<E extends keyof PlayerListeners>(name: E, callback: PlayerListeners[E]) {
    if (!this.events[name]) return
    const index = this.events[name]!.indexOf(callback)
    if (index > -1) {
      this.events[name]!.splice(index, 1)
    }
  }

  offAll() {
    this.events = null as any
  }

  //TODO: Parameters<PlayerListeners[E]>[1] 为空可不传递 payload
  emit<E extends keyof PlayerListeners>(name: E, payload?: Parameters<PlayerListeners[E]>[1]) {
    if (this.events[name]?.length) {
      ;[...this.events[name]!].forEach((callback) => {
        callback(name as never, payload)
      })
    }

    this.events['*']?.forEach((callback: any) => {
      callback(name as never, payload)
    })
  }

  listenerCount<E extends keyof PlayerListeners>(event: E) {
    return this.events[event].length
  }
}
