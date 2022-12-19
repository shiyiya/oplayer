import { EVENTS, PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import EventEmitter from './event'
import I18n from './i18n'
import { isPlainObject } from './utils'
import $ from './utils/dom'
import { isIOS, isQQBrowser } from './utils/platform'

import type {
  PlayerEvent,
  PlayerEventName,
  PlayerListener,
  PlayerOptions,
  PlayerPlugin,
  Source
} from './types'

const players: Player[] = []

export class Player {
  container: HTMLElement
  options: Required<PlayerOptions>

  locales: I18n
  eventEmitter = new EventEmitter()

  pluginsFactory: PlayerPlugin[] = []
  plugins: /* ReturnTypePlugins<Plugins> &*/ any = {} as any // TODO: type not work

  $root: HTMLElement
  $video: HTMLVideoElement
  listeners: Record<typeof EVENTS[number] | 'fullscreenchange' | 'fullscreenerror', Function> =
    Object.create(null)

  hasError: boolean = false
  isCustomLoader: boolean = false

  //https://developer.chrome.com/blog/play-request-was-interrupted/
  _playPromise: Promise<void> | undefined

  constructor(el: HTMLElement | string, options?: PlayerOptions | string) {
    this.container = typeof el == 'string' ? document.querySelector(el)! : el
    if (!this.container)
      throw new Error((typeof el == 'string' ? el : 'Element') + 'does not exist')

    this.options = Object.assign(
      {
        autoplay: false,
        muted: false,
        loop: false,
        volume: 1,
        preload: 'metadata',
        playbackRate: 1,
        playsinline: true,
        lang: 'auto',
        source: {},
        videoAttr: {},
        isLive: false,
        autopause: true,
        isNativeUI: () => isQQBrowser // 部分浏览器会劫持 video
      } as const,
      typeof options === 'string' ? { source: { src: options } } : options
    )

    this.locales = new I18n(this.options.lang)
  }

  static make(el: HTMLElement | string, options?: PlayerOptions | string) {
    return new Player(el, options)
  }

  use(plugins: PlayerPlugin[]) {
    plugins.forEach((plugin) => {
      this.pluginsFactory.push(plugin)
    })
    return this
  }

  create() {
    this.render()
    this.initEvent()
    this.applyPlugins()
    if (this.options.source.src) this.load(this.options.source)
    players.push(this)
    return this
  }

  initEvent() {
    const errorHandler = (payload: ErrorEvent) => {
      this.hasError = true
      this.emit('error', payload)
    }
    this.listeners['error'] = errorHandler
    this.$video.addEventListener('error', (e) => this.listeners['error'](e))

    const eventHandler = (eventName: string, payload: Event) =>
      this.eventEmitter.emit(eventName, payload)

    ;(
      [
        [
          this.$video,
          ['fullscreenchange', 'webkitbeginfullscreen', 'webkitendfullscreen'],
          ['fullscreenerror', 'webkitfullscreenerror']
        ],
        [
          this.$root,
          ['fullscreenchange', 'webkitfullscreenchange'],
          ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror']
        ]
      ] as const
    ).forEach((it) => {
      const [target, ...eventNames] = it
      eventNames.forEach((eventName) => {
        const polyfillName = eventName[0]
        this.listeners[polyfillName] = eventHandler
        eventName.forEach((name) => {
          target.addEventListener(name, (e) => this.listeners[polyfillName](polyfillName, e))
        })
      })
    })
    ;(
      [
        [this.$video, VIDEO_EVENTS],
        [this.$root, PLAYER_EVENTS]
      ] as const
    ).forEach(([target, events]) => {
      events.forEach((eventName) => {
        this.listeners[eventName] = eventHandler
        target.addEventListener(eventName, (e) => this.listeners[eventName](eventName, e), {
          passive: true
        })
      })
    })
  }

  render() {
    this.$video = $.create(
      `video.${$.css(`
        width: 100%;
        height: 100%;
        display: block;
        position: relative;
      `)}`,
      {
        autoplay: this.options.autoplay,
        loop: this.options.loop,
        playsinline: this.options.playsinline,
        'webkit-playsinline': this.options.playsinline,
        'x5-playsinline': this.options.playsinline,
        preload: this.options.preload,
        poster: this.options.source.poster,
        ...this.options.videoAttr
      }
    )

    // not working `setAttribute`
    this.$video.muted = !!this.options.muted
    this.$video.volume = this.options.volume

    this.$root = $.create(
      `div.${$.css(`
        position: relative;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #000;
      `)}`
    )

    $.render(this.$video, this.$root)
    $.render(this.$root, this.container)
  }

  async load(source: Source) {
    for await (const plugin of this.pluginsFactory) {
      if (plugin.load) {
        const match = await plugin.load(this, source, { loader: this.isCustomLoader })
        if (match && !this.isCustomLoader) this.isCustomLoader = true
      }
    }
    if (!this.isCustomLoader) {
      this.$video.src = source.src
    }
  }

  applyPlugins() {
    this.pluginsFactory.forEach((factory) => {
      if (factory.apply) {
        const returnValues = factory.apply(this)
        if (returnValues) {
          const key = factory.key || factory.name
          if (isPlainObject(returnValues)) {
            this.plugins[key] = Object.assign({}, this.plugins[key], returnValues)
          } else {
            this.plugins[key] = returnValues
          }
        }
      }
    })
  }

  on(name: PlayerEventName | PlayerListener, listener?: PlayerListener, options = { once: false }) {
    if (typeof name === 'string') {
      if (options.once) {
        this.eventEmitter.once(name, listener!)
      } else {
        this.eventEmitter.on(name, listener!)
      }
    } else if (Array.isArray(name)) {
      this.eventEmitter.onAny(name as string[], listener!)
    } else if (typeof name === 'function') {
      this.eventEmitter.on('*', name!)
    }
    return this
  }

  off(name: PlayerEventName, listener: PlayerListener) {
    this.eventEmitter.off(name as string, listener)
  }

  offAny(name: PlayerEventName) {
    this.eventEmitter.offAny(name as string)
  }

  emit(name: PlayerEventName, payload?: PlayerEvent['payload']) {
    this.eventEmitter.emit(name as any, payload)
  }

  setPoster(poster: string) {
    this.$video.poster = poster
  }

  play() {
    if (!this.$video.src) return
    if (this.options.autopause) {
      for (let i = 0; i < players.length; i++) {
        const player = players[i]
        if (player != this) player!.pause()
      }
    }

    if (this._playPromise?.then) {
      return (this._playPromise = this._playPromise?.then(() => this.$video.play()))
    } else {
      return this.$video.play()
    }
  }

  pause() {
    if (this._playPromise?.then) {
      return this._playPromise.then(() => this.$video.pause())
    } else {
      return this.$video.pause()
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      return this.pause()
    } else {
      return this.play()
    }
  }

  mute() {
    this.$video.muted = true
  }

  unmute() {
    this.$video.muted = false
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute()
    } else {
      this.mute()
    }
  }

  setVolume(volume: number) {
    this.$video.volume = volume > 1 ? 1 : volume < 0 ? 0 : volume
    if (this.$video.volume > 0 && this.isMuted) {
      this.unmute()
    }
  }

  setPlaybackRate(rate: number) {
    this.$video.playbackRate = rate
  }

  seek(time: number) {
    this.$video.currentTime = time
  }

  setLoop(loop: boolean) {
    this.$video.loop = loop
  }

  enterFullscreen() {
    if (isIOS) {
      return (this.$video as any).webkitEnterFullscreen()
    } else {
      return this._requestFullscreen.call(this.$root, { navigationUI: 'hide' })
    }
  }

  exitFullscreen() {
    return this._exitFullscreen.call(document)
  }

  get isFullscreenEnabled() {
    return (
      Boolean(isIOS && (this.$video as any).webkitEnterFullscreen) ||
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    )
  }

  get isFullScreen() {
    return Boolean(
      (isIOS && (this.$video as any).webkitDisplayingFullscreen) ||
        (document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement) === this.$root
    )
  }

  toggleFullScreen() {
    if (this.isFullScreen) {
      return this.exitFullscreen()
    } else {
      return this.enterFullscreen()
    }
  }

  get isPipEnabled() {
    return document.pictureInPictureEnabled
  }

  enterPip() {
    return this.$video.requestPictureInPicture()
  }

  exitPip() {
    if (this.isInPip) {
      return document.exitPictureInPicture()
    }
    return false
  }

  get isInPip() {
    return document.pictureInPictureElement == this.$video
  }

  togglePip() {
    if (this.isInPip) {
      return this.exitPip()
    } else {
      return this.enterPip()
    }
  }

  _resetStatus() {
    this._playPromise = undefined
    this.hasError = false
    this.isCustomLoader = false
    this.$video.pause()
    //TODO: Cancel req
    // this.$video.src = URL.createObjectURL(new Blob([new Uint8Array([])], { type: 'video/mp4' }))
  }

  changeQuality(source: Omit<Source, 'poster'>) {
    this.emit('videoqualitychange', source)
    this.options.source = { ...this.options.source, ...source }
    return this._loader(source, { keepPlaying: true, keepTime: true }).then(() => {
      this.emit('videoqualitychanged', source)
    })
  }

  changeSource(source: Source, keepPlaying: boolean = true) {
    this.emit('videosourcechange', source)
    this.$video.poster = source.poster || ''
    this.options.source = source
    return this._loader(source, { keepPlaying }).then(() => {
      this.emit('videosourcechanged', source)
    })
  }

  _loader(source: Source, options: { keepPlaying: boolean; keepTime?: boolean }) {
    const { isPlaying, currentTime } = this
    const { keepPlaying, keepTime } = options
    this._resetStatus()
    return (this._playPromise = new Promise((resolve, reject) => {
      this.load(source)
        .then(() => {
          const shouldPlay = keepPlaying && isPlaying
          if (!shouldPlay && !keepTime) {
            resolve()
          } else {
            if (this.options.preload == 'none') this.$video.load()
            this.on(
              'canplay',
              () => {
                if (keepTime) this.seek(currentTime)
                if (shouldPlay) this.$video.play()
                resolve()
              },
              { once: true }
            )
          }
        })
        .catch(reject)
    }))
  }

  destroy() {
    players.splice(players.indexOf(this), 1)
    this.emit('destroy')
    this.pause()
    this.isFullScreen && this.exitFullscreen()
    this.$video.src = ''
    this.$video.remove()
    this.container.remove()
    this.eventEmitter.offAll()
  }

  get isNativeUI() {
    return this.options.isNativeUI()
  }

  get state() {
    return this.$video.readyState
  }

  get isPlaying() {
    return !this.$video.paused
  }

  get isMuted() {
    return this.$video.muted
  }

  get isEnded() {
    return this.$video.ended
  }

  get isLoop() {
    return this.$video.loop
  }

  get isAutoPlay() {
    return this.$video.autoplay
  }

  get duration() {
    return this.$video.duration
  }

  get buffered() {
    return this.$video.buffered
  }

  get currentTime() {
    return this.$video.currentTime
  }

  get volume() {
    return this.$video.volume
  }

  get playbackRate() {
    return this.$video.playbackRate
  }

  get _requestFullscreen(): Element['requestFullscreen'] {
    return (
      HTMLElement.prototype.requestFullscreen ||
      (HTMLElement.prototype as any).webkitRequestFullscreen ||
      (HTMLElement.prototype as any).mozRequestFullScreen ||
      (HTMLElement.prototype as any).msRequestFullscreen
    )
  }

  get _exitFullscreen(): Document['exitFullscreen'] {
    return (
      Document.prototype.exitFullscreen ||
      (Document.prototype as any).webkitExitFullscreen ||
      (Document.prototype as any).cancelFullScreen ||
      (Document.prototype as any).mozCancelFullScreen ||
      (Document.prototype as any).msExitFullscreen
    )
  }

  static get version() {
    return __VERSION__
  }
}

if (typeof window !== undefined) {
  console.log(
    '%cOPlayer%c v%s\n %c\nOh! Another HTML5 video player.\nhttps://github.com/shiyiya/oplayer\n',
    'font-size:32px;',
    'font-size:12px;color:#999999;',
    Player.version,
    'font-size:14px;'
  )
}
