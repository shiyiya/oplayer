import { html, render } from 'lit'
import { ref } from 'lit/directives/ref.js'
import { PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import E, { Listener, OEvent } from './event'
import style from './index.css?raw'

console.log(__VERSION__)

//TODO: __VERSION__
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
  load?: (player: Player, video: HTMLVideoElement, src: string) => boolean
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

  readonly on = (name: string | Listener | string[], listener?: Listener) => {
    if (typeof name === 'string') {
      this.#E.on(name, listener!)
    } else if (Array.isArray(name)) {
      this.#E.onAny(name, listener!)
    } else if (typeof name === 'function') {
      this.#E.on('*', name!)
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
    this.#applyPlugins()
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
        this.#isCustomLoader = plugin.load(this, this.#video, src)
      }
    })
    if (!this.#isCustomLoader) {
      this.#video.src = src
    }
  }

  #applyPlugins = () => {
    this.#plugins.forEach((plugin) => {
      if (plugin.apply) {
        plugin.apply(this)
      }
    })
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

  toggleMute() {
    if (this.isMuted) {
      this.unmute()
    } else {
      this.mute()
    }
  }
  setVolume(volume: number) {
    this.#video.volume = volume
    if (volume > 0 && this.isMuted) {
      this.unmute()
    }
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

  enterFullscreen() {
    this.#requestFullscreen.call(this.$root, { navigationUI: 'hide' })
  }

  exitFullscreen() {
    this.#_exitFullscreen.call(document)
  }

  get isFullScreen() {
    return document.fullscreenElement === this.$root
  }

  toggleFullScreen() {
    if (this.isFullScreen) {
      this.exitFullscreen()
    } else {
      this.enterFullscreen()
    }
  }

  get isPipEnabled() {
    return document.pictureInPictureEnabled
  }

  enterPip() {
    this.#video.requestPictureInPicture()
  }

  exitPip() {
    if (this.isInPip) {
      document.exitPictureInPicture()
    }
  }

  get isInPip() {
    return document.pictureInPictureElement == this.#video
  }

  togglePip() {
    if (this.isInPip) {
      document.exitPictureInPicture()
    } else {
      this.#video.requestPictureInPicture()
    }
  }

  changeSource(sources: string | Source) {
    this.hasError = false
    this.#isCustomLoader = false
    this.load(typeof sources === 'string' ? sources : sources.src)
  }

  destroy() {
    this.pause()
    this.isFullScreen && this.exitFullscreen()
    this.#plugins.forEach((plugin) => plugin.destroy?.())
    this.#plugins.clear()
    this.#E.offAll()
    this.#video.src = ''
    this.#video.remove()
    this.#container.remove()
    this.emit('destroy')
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

  get #requestFullscreen(): Element['requestFullscreen'] {
    return (
      HTMLElement.prototype.requestFullscreen ||
      (HTMLElement.prototype as any).webkitRequestFullscreen ||
      (HTMLElement.prototype as any).mozRequestFullScreen ||
      (HTMLElement.prototype as any).msRequestFullscreen
    )
  }

  get #_exitFullscreen(): Document['exitFullscreen'] {
    return (
      Document.prototype.exitFullscreen ||
      (Document.prototype as any).webkitExitFullscreen ||
      (Document.prototype as any).cancelFullScreen ||
      (Document.prototype as any).mozCancelFullScreen ||
      (Document.prototype as any).msExitFullscreen
    )
  }

  get plugins() {
    return [...this.#plugins].map((plugin) => plugin.name || 'anonymous')
  }

  static get version() {
    return pkg.version || '__VERSION__' //Not Working
  }
}
