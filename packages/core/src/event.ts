export type PlayerEvent<T = any> = {
  type: string | string[]
  payload: T
}

export type PlayerListener = (event: PlayerEvent) => void

/**
 * Lightweight EventEmitter for OPlayer.
 *
 * - `on()` — register listener for an event
 * - `once()` — one-time listener, tracked via WeakMap (no property mutation)
 * - `off()` — remove specific listener (also resolves once() wrappers)
 * - `onAny()` — register listener for multiple events
 * - `offAny()` — clear all listeners for a specific event
 * - `offAll()` — clear everything
 * - `emit()` — emit with try/catch per listener + array clone for iteration safety
 */
export default class EventEmitter {
  private _listeners: Record<string, PlayerListener[]> = Object.create(null)
  private _onceRefs: WeakMap<PlayerListener, PlayerListener>

  constructor() {
    this._onceRefs = new WeakMap()
  }

  /** Register a listener for an event. */
  on(name: string, callback: PlayerListener): void {
    (this._listeners[name] ??= []).push(callback)
  }

  /** Register a listener for multiple events. */
  onAny(names: readonly string[], callback: PlayerListener): void {
    for (let i = 0; i < names.length; i++) {
      this.on(names[i]!, callback)
    }
  }

  /** Register a one-time listener. The callback is automatically removed after firing. */
  once(name: string, callback: PlayerListener): void {
    const wrapper: PlayerListener = (event) => {
      callback({ type: name, payload: event.payload })
    }
    this._onceRefs.set(wrapper, callback)
    this.on(name, wrapper)
  }

  /** Remove a specific listener. Also works if callback was registered via once(). */
  off(name: string, callback: PlayerListener): void {
    const queue = this._listeners[name]
    if (!queue) return

    // Resolve once() wrapper → original so off(onceCb) and off(originalCb) both work
    const target = this._onceRefs.get(callback) ?? callback
    this._onceRefs.delete(callback)

    for (let i = queue.length - 1; i >= 0; i--) {
      const item = queue[i]!
      const resolved = this._onceRefs.get(item) ?? item
      if (resolved === target) {
        this._onceRefs.delete(item)
        queue.splice(i, 1)
      }
    }
  }

  /** Clear all listeners for a specific event. */
  offAny(name: string): void {
    const queue = this._listeners[name]
    if (queue) {
      for (let i = 0; i < queue.length; i++) {
        this._onceRefs.delete(queue[i]!)
      }
      queue.length = 0
    }
  }

  /** Clear all listeners for all events. */
  offAll(): void {
    this._listeners = Object.create(null)
    this._onceRefs = new WeakMap()
  }

  /** Emit an event. Each listener is wrapped in try/catch so one error doesn't break others. */
  emit(name: string, payload?: unknown): void {
    const targets = this._listeners[name]?.slice() ?? []
    const wildcards = this._listeners['*']?.slice() ?? []

    const event: PlayerEvent = { type: name, payload }

    for (let i = 0; i < targets.length; i++) {
      try {
        targets[i]!(event)
      } catch (err) {
        console.error('[OPlayer] listener error:', err)
      }
    }

    for (let i = 0; i < wildcards.length; i++) {
      try {
        wildcards[i]!(event)
      } catch (err) {
        console.error('[OPlayer] wildcard listener error:', err)
      }
    }
  }
}
