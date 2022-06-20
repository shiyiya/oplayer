import { VIDEO_EVENTS } from './constants'

export type PlayerPlugin = {
  apply: (ctX: Player, next: (...arg: any[]) => void) => void
  destroy?: VoidFunction
}

type Event = {
  type: string
  payload: any
  _raw?: any
}

export type Listener = (enevt: Event) => void

export type Options = {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  preload?: 'auto' | 'metadata' | 'none'
  poster?: string
  playbackRate?: number
  src: string
}

export default class Player {
  constructor(el: HTMLElement, options: Options | string) {
    this.#container = el
    this.#options = Object.assign(
      {
        autoplay: false,
        muted: false,
        loop: false,
        volume: 1,
        width: el.offsetWidth,
        height: el.offsetHeight,
        preload: 'auto',
        poster: '',
        playbackRate: 1
      },
      typeof options === 'string' ? { src: options } : options
    )
  }

  readonly #options: Required<Options>
  readonly #container: HTMLElement

  readonly #plugins: Set<PlayerPlugin> = new Set()
  readonly #listeners: Set<Listener> = new Set()

  videoType: string
  $root: HTMLElement
  #video: HTMLVideoElement

  static make(el: HTMLElement, options: Options | string): Player {
    return new Player(el, options)
  }

  readonly use = (plugins: PlayerPlugin | PlayerPlugin[]) => {
    ;[plugins].flat().forEach((plugin) => {
      this.#plugins.add(plugin)
    })
    return this
  }

  readonly on = (listener: Listener) => {
    this.#listeners.add(listener)
    return this
  }

  readonly create = () => {
    const next = Promise.resolve()
    this.#plugins.forEach((plugin) => {
      next.then(() => {
        return new Promise<any>((resolve) => {
          plugin.apply(this, resolve)
        })
      })
    })

    this.init()
    this.initEvent()
    return this
  }

  init = () => {
    this.#video = document.createElement('video')
    if (!this.#video.src) {
      this.#video.src = this.#options.src
    }

    this.#video.autoplay = this.#options.autoplay
    this.#video.muted = this.#options.muted
    this.#video.loop = this.#options.loop
    this.#video.volume = this.#options.volume
    this.#video.preload = this.#options.preload
    this.#video.poster = this.#options.poster
    this.#video.playbackRate = this.#options.playbackRate

    this.#container.appendChild(this.#video)
  }

  initEvent = () => {
    Object.values(VIDEO_EVENTS).forEach((event) => {
      this.#video.addEventListener(event, (e) => {
        console.log(e)
        this.#listeners.forEach((listener) => {
          listener({ type: e.type, payload: e })
        })
      })
    })
  }

  get video() {
    return this.#video
  }

  get container() {
    return this.#container
  }

  get state() {
    return this.#video.readyState
  }

  get isLoading() {
    return this.#video.readyState < this.#video.HAVE_FUTURE_DATA
  }

  get isLoaded() {
    return this.#video.readyState >= this.#video.HAVE_FUTURE_DATA // 3
  }

  get canPlay() {
    return this.#video.readyState >= this.#video.HAVE_ENOUGH_DATA // 4
  }

  get isPlaying() {
    return this.#video.paused === false
  }

  get isMuted() {
    return this.#video.muted
  }

  get isEnded() {
    return this.#video.ended
  }

  get duration() {
    return this.#video.duration
  }

  get buffered() {
    return this.#video.buffered
  }

  get currentTime() {
    return this.#video.currentTime
  }

  get volume() {
    return this.#video.volume
  }

  get playbackRate() {
    return this.#video.playbackRate
  }

  play = () => {
    if (this.canPlay) {
      this.#video.play()
    }
  }

  pause() {
    this.#video.pause()
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  mute() {
    this.#video.muted = true
  }

  unmute() {
    this.#video.muted = false
  }

  setVolume(volume: number) {
    this.#video.volume = volume
  }

  setPlaybackRate(rate: number) {
    this.#video.playbackRate = rate
  }

  seek(time: number) {
    this.#video.currentTime = time
  }

  setLoop(loop: boolean) {
    this.#video.loop = loop
  }

  get requestFullscreen(): Element['requestFullscreen'] {
    return (
      HTMLElement.prototype.requestFullscreen ||
      (HTMLElement.prototype as any).webkitRequestFullscreen ||
      (HTMLElement.prototype as any).mozRequestFullScreen ||
      (HTMLElement.prototype as any).msRequestFullscreen
    )
  }

  get exitFullscreen(): Document['exitFullscreen'] {
    return (
      Document.prototype.exitFullscreen ||
      (Document.prototype as any).webkitExitFullscreen ||
      (Document.prototype as any).cancelFullScreen ||
      (Document.prototype as any).mozCancelFullScreen ||
      (Document.prototype as any).msExitFullscreen
    )
  }

  enter() {
    this.requestFullscreen.call(this.#video, { navigationUI: 'hide' })
  }

  exit() {
    this.exitFullscreen.call(document)
    return true
  }

  toggleFullScreen() {
    if (document.fullscreenElement === this.#video) {
      this.exit()
    } else {
      this.enter()
    }
  }

  changeSource(sources: string) {}

  destroy() {}
}
