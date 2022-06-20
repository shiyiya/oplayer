export type PlayerPlugin = (ctx: Player) => any
export type Listener = (enevt: { action: string; payload: any }) => any

export type Options = {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  width?: number
  height?: number
  preload?: 'auto' | 'metadata' | 'none'
  poster?: string
  playbackRate?: number
}

export default class Player {
  constructor(el: HTMLElement, options: Options = {}) {
    this.#options = {
      autoplay: false,
      muted: false,
      loop: false,
      volume: 1,
      width: el.offsetWidth,
      height: el.offsetHeight,
      preload: 'auto',
      poster: '',
      playbackRate: 1,
      ...options
    }
    this.#container = el
  }

  readonly #options: Options
  readonly #container: HTMLElement
  readonly #plugins: Set<PlayerPlugin> = new Set()
  readonly #listeners: Set<Listener> = new Set()

  static make(el: HTMLElement): Player {
    return new Player(el)
  }

  readonly use = (plugins: PlayerPlugin | PlayerPlugin[]) => {
    ;[plugins].flat().forEach((plugin) => {
      this.#plugins.add(plugin)
    })
    return this
  }

  readonly create = async () => {
    await Promise.all([...this.#plugins].map((loader) => loader(this)))
    return this
  }

  init() {}

  play() {}

  pause() {}

  togglePlay() {}

  mute() {}

  unmute() {}

  setVolume(volume: number) {}

  setPlaybackRate(rate: number) {}

  seek(time: number) {}

  setLoop(loop: boolean) {}

  changeSource(el: HTMLElement, sources: string[]) {}

  destroy() {}
}
