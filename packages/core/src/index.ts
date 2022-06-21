import style from './index.css'
import { html, render } from 'lit'
import E, { Listener, OEvent } from './event'
import { PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import { ref } from 'lit/directives/ref.js'

export type PlayerPlugin = {
  name: string
  version?: string
  beforeRender?: (player: Player) => void
  apply?: (player: Player, next: (...arg: any[]) => void) => void
  load?: (src: string, player: Player) => boolean
  destroy?: VoidFunction
}

export type Options = {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  preload?: 'auto' | 'metadata' | 'none'
  poster?: string
  playbackRate?: number
  playsinline?: boolean
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
        playbackRate: 1,
        playsinline: true
      },
      typeof options === 'string' ? { src: options } : options
    )
  }

  readonly #options: Required<Options>
  readonly #container: HTMLElement
  readonly #plugins: Set<PlayerPlugin> = new Set()

  readonly #E = new E()

  $root: HTMLElement
  #video: HTMLVideoElement
  #isCustomLoader: boolean

  static make(el: HTMLElement, options: Options | string): Player {
    return new Player(el, options)
  }

  readonly use = (plugins: PlayerPlugin | PlayerPlugin[]) => {
    ;[plugins].flat().forEach((plugin) => {
      this.#plugins.add(plugin)
    })
    return this
  }

  readonly on = (name: string | Listener, listener?: Listener) => {
    if (typeof name === 'string') {
      this.#E.on(name, listener!)
    } else {
      this.#E.on('*', name)
    }
  }

  readonly emit = (name: string, payload: OEvent) => {
    this.#E.emit(name, payload)
  }

  readonly create = () => {
    this.render()
    this.initEvent()
    this.load(this.#options.src)
    return this
  }

  initEvent = () => {
    Object.values(VIDEO_EVENTS).forEach((event) => {
      this.#video.addEventListener(event, (e) => {
        this.#E.emit(event, e)
      })
    })
    Object.values(PLAYER_EVENTS).forEach((event) => {
      this.$root.addEventListener(event, (e) => {
        this.#E.emit(event, e)
      })
    })
  }

  readonly render = () => {
    render(
      html`
        <style>
          ${style}
        </style>
        <div class="oh-player" ${ref((el) => (this.$root = el as HTMLDivElement))}>
          <video
            class="oh-video"
            ${ref((el) => (this.#video = el as HTMLVideoElement))}
            ?autoplay=${this.#options.autoplay}
            ?muted=${this.#options.muted}
            ?loop=${this.#options.loop}
            ?playsinline=${this.#options.playsinline}
            muted=${this.#options.muted}
            volume=${this.#options.volume}
            preload=${this.#options.preload}
            poster=${this.#options.poster}
          />
        </div>
      `,
      // src=${this.#options.src}
      this.#container
    )
  }

  load = (src: string) => {
    this.#plugins.forEach((plugin) => {
      if (plugin.load && !this.#isCustomLoader) {
        this.#isCustomLoader = plugin.load(src, this)
      }
    })
    if (!this.#isCustomLoader) {
      this.#video.src = src
    }

    console.log(!this.#isCustomLoader)
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
    return this.#video.duration || 0
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

  changeSource(sources: string) {
    this.#isCustomLoader = false
    this.load(sources)
  }

  destroy() {}
}
