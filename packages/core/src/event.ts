export type OEvent = {
  type: string
  payload: any
  _raw?: any
}

export type Listener = (enevt: OEvent) => void

export default class E {
  events: Record<string, Listener[]> = Object.create(null)

  on(name: string, callback: Listener) {
    if (!this.events[name]) {
      this.events[name] = []
    }
    this.events[name]!.push(callback)
  }

  onAny(names: string[], callback: Listener) {
    names.forEach((name) => this.on(name, callback))
  }

  once(name: string, callback: Listener) {
    const once = (event: OEvent) => {
      callback({ type: name, payload: event.payload })
      this.off(name, once)
    }
    this.on(name, once)
  }

  off(name: string, callback: Listener) {
    if (!this.events[name]) return
    const index = this.events[name]!.indexOf(callback)
    if (index > -1) {
      this.events[name]!.splice(index, 1)
    }
  }

  offAll() {
    this.events = Object.create(null)
  }

  emit(name: string, payload: any) {
    this.events[name]?.forEach((callback) => {
      callback({ type: name, payload })
    })
    this.events['*']?.forEach((callback) => {
      callback({ type: name, payload })
    })
  }
}
