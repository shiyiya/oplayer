import style from './index.css'
import { html, render } from 'lit'
import E, { Listener, OEvent } from './event'
import { PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import { ref } from 'lit/directives/ref.js'

// @ts-ignore
import pkg from '../package.json'

export type Source = {
  src: string
  poster?: string
}

export type PlayerPlugin = {
  name: string
  version?: string
  beforeRender?: (player: Player) => void
  apply?: (player: Player) => void
  load?: (src: string, player: Player) => boolean
  destroy?: VoidFunction
}

export type Options = {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  preload?: 'auto' | 'metadata' | 'none'
  playbackRate?: number
  playsinline?: boolean
  source: Source
}

export class Player {
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
      typeof options === 'string' ? { source: { src: options } } : options
    )
  }

  readonly #options: Required<Options>
  readonly #container: HTMLElement

  readonly #E = new E()
  readonly #plugins: Set<PlayerPlugin> = new Set()

  $root: HTMLElement
  #video: HTMLVideoElement
  #isCustomLoader: boolean

  hasError: boolean = false

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
    return this
  }

  readonly emit = (name: string, payload?: OEvent) => {
    this.#E.emit(name, payload)
  }

  readonly create = () => {
    this.render()
    this.initEvent()
    this.load(this.#options.source.src)
    this.applyPlugins()
    return this
  }

  initEvent = () => {
    this.on('error', () => {
      this.hasError = true
    })
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
    this.#container.classList.add('oh-wrap')
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
            poster=${this.#options.source.poster}
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
  }

  applyPlugins = () => {
    this.#plugins.forEach((plugin) => {
      if (plugin.apply) {
        plugin.apply(this)
      }
    })
  }

  //TODO: 不暴露接口
  get __video() {
    return this.#video
  }

  get container() {
    return this.#container
  }

  get state() {
    return this.#video.readyState
  }

  get isLoading() {
    return this.#video.readyState < this.#video.HAVE_FUTURE_DATA && !this.hasError
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
    this.requestFullscreen.call(this.$root, { navigationUI: 'hide' })
  }

  exit() {
    this.exitFullscreen.call(document)
  }

  toggleFullScreen() {
    if (document.fullscreenElement === this.$root) {
      this.exit()
    } else {
      this.enter()
    }
  }

  changeSource(sources: string | Source) {
    this.hasError = false
    this.#isCustomLoader = false
    this.load(typeof sources === 'string' ? sources : sources.src)
  }

  destroy() {
    this.pause()
    this.#video.src = ''
    this.#video.remove()
    this.#container.remove()
    this.#E.offAll()
    this.#plugins.clear()
    this.emit('destroy')
  }

  get plugins() {
    return [...this.#plugins].map((plugin) => plugin.name || 'anonymous')
  }

  static get version() {
    return pkg.version
  }
}
