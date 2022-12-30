import type { PlayerListener, PlayerEvent } from './types'

export default class EventEmitter {
  events: Record<string, PlayerListener[]> = Object.create(null)

  offQueue: Function[] = []

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
      /**
       * 直接移除会修改地址，导致下面 emit 的 foreach 循环变少
       * eg: 下面只会输出一次hello
       * const obj = {
           a: [1, 2, 3],
            fn() {
              console.log('hello')
              obj.a.splice(0, 2)
          }
        }

        obj.a.forEach(obj.fn)
       */
      this.offQueue.push(() => this.off(name, once))
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
    this.events[name]?.forEach((callback) => {
      callback({ type: name, payload })
    })

    this.events['*']?.forEach((callback) => {
      callback({ type: name, payload })
    })

    while (this.offQueue.length) {
      this.offQueue.shift()!()
    }
  }
}
