import { EVENTS, PLAYER_EVENTS, VIDEO_EVENTS } from './constants'
import EventEmitter from './event'
import I18n from './i18n'
import $ from './utils/dom'
import { isQQBrowser } from './utils/platform'

import type {
  Destroyable,
  PlayerEvent,
  PlayerEventName,
  PlayerListener,
  PlayerOptions,
  PlayerPlugin,
  Source
} from './types'

const defaultOptions = {
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
  isNativeUI: () => isQQBrowser
}

export class Player<Context extends Record<string, any> = Record<string, any>> {
  static players: Player[] = []

  container: HTMLElement
  options: Required<PlayerOptions>

  locales: I18n
  eventEmitter: EventEmitter

  plugins: PlayerPlugin[] = []
  context: Context = {} as Context
  // hls|dash|etc. instance
  loader?: Destroyable

  $root!: HTMLDivElement
  $video!: HTMLVideoElement
  listeners: Record<(typeof EVENTS)[number] | 'fullscreenchange' | 'fullscreenerror', Function> =
    Object.create(null)

  hasError: boolean = false
  isSourceChanging: boolean = false

  constructor(el: HTMLElement | string, options?: PlayerOptions | string) {
    this.container = typeof el == 'string' ? document.querySelector(el)! : el
    if (!this.container) throw new Error((typeof el == 'string' ? el : 'Element') + 'does not exist')

    this.options = Object.assign(
      {},
      defaultOptions,
      typeof options === 'string' ? { source: { src: options } } : options
    )

    this.locales = new I18n(this.options.lang)
    this.eventEmitter = new EventEmitter()
  }

  static make<Context extends Record<string, any> = Record<string, any>>(
    el: HTMLElement | string,
    options?: PlayerOptions | string
  ) {
    return new Player<Context>(el, options)
  }

  use(plugins: PlayerPlugin[]) {
    plugins.forEach((plugin) => {
      this.plugins.push(plugin)
    })
    return this
  }

  create() {
    this.render()
    this.initEvent()
    this.plugins.forEach(this.applyPlugin.bind(this))
    if (this.options.source.src) this.load(this.options.source)
    Player.players.push(this)
    return this
  }

  initEvent() {
    const errorHandler = (payload: ErrorEvent) => {
      if (this.$video.error) {
        this.hasError = true
        this.eventEmitter.emit('error', payload)
      }
    }
    this.listeners['error'] = errorHandler
    this.$video.addEventListener('error', (e) => this.listeners['error'](e))

    const eventHandler = (eventName: string, payload: Event) => {
      this.eventEmitter.emit(eventName, payload)
    }

    ;(
      [
        [
          this.$video,
          ['fullscreenchange', 'webkitbeginfullscreen', 'webkitendfullscreen'],
          ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror']
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
          target.addEventListener(
            name,
            (e) => {
              this.listeners[polyfillName](polyfillName, e)
            },
            { passive: true }
          )
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
        if (!this.listeners[eventName]) {
          this.listeners[eventName] = eventHandler
          target.addEventListener(
            eventName,
            (e) => {
              this.listeners?.[eventName](eventName, e)
            },
            { passive: true }
          )
        }
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
    const { muted, volume, playbackRate } = this.options
    if (!!muted) this.mute()
    this.$video.volume = volume
    // 设置 src 后执行
    setTimeout(() => {
      // maybe destroyed
      if (this.$root) this.setPlaybackRate(playbackRate)
    })

    this.$root = $.create(
      `div.${$.css(`
        position: relative;
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
    await this.loader?.destroy()
    this.loader = undefined
    for (const plugin of this.plugins) {
      if (plugin.load) {
        const returned = await plugin.load(this, source)
        if (returned != false && !this.loader) {
          this.loader = returned
          this.emit('loaderchange', returned)
          break
        }
      }
    }
    if (!this.loader) {
      this.$video.src = source.src
    }

    return source
  }

  applyPlugin(plugin: PlayerPlugin) {
    this.plugins.push(plugin)
    const returned = plugin.apply(this)
    const { name, key } = plugin
    if (returned) {
      //@ts-ignore
      this.context[key || name] = returned
    }
  }

  on(name: PlayerEventName | PlayerListener, listener?: PlayerListener) {
    if (typeof name === 'string') {
      this.eventEmitter.on(name, listener!)
    } else if (Array.isArray(name)) {
      this.eventEmitter.onAny(name as string[], listener!)
    } else if (typeof name === 'function') {
      this.eventEmitter.on('*', name!)
    }
    return this
  }

  once(name: PlayerEventName | PlayerListener, listener?: PlayerListener) {
    this.eventEmitter.once(name as string, listener!)
  }

  off(name: PlayerEventName, listener: PlayerListener) {
    this.eventEmitter.off(name as string, listener)
  }

  emit(name: PlayerEventName, payload?: PlayerEvent['payload']) {
    this.eventEmitter.emit(name as any, payload)
  }

  setPoster(poster: string) {
    this.$video.poster = poster
  }

  play() {
    if ((!this.$video.src && !this.$video.currentSrc) || this.isSourceChanging) return
    if (this.options.autopause) {
      for (let i = 0; i < Player.players.length; i++) {
        const player = Player.players[i]
        if (player != this) player!.pause()
      }
    }

    return this.$video.play()
  }

  pause() {
    return this.$video.pause()
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

  async enterFullscreen() {
    if (this.isInPip) await this.exitPip()

    if (this._requestFullscreen) {
      this._requestFullscreen.call(this.$root, { navigationUI: 'hide' })
    } else {
      ;(this.$video as any).webkitEnterFullscreen()
    }
  }

  exitFullscreen() {
    return this._exitFullscreen.call(document)
  }

  get isFullscreenEnabled() {
    return (
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled ||
      (this.$video as any).webkitEnterFullscreen //ios
    )
  }

  get isFullScreen() {
    return Boolean(
      (document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement) === this.$root ||
        //ios
        (this.$video as any).webkitDisplayingFullscreen
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

  changeQuality(source: Omit<Source, 'poster'> | Promise<Omit<Source, 'poster'>>) {
    return this._loader(source, {
      keepPlaying: true,
      keepTime: true,
      preEvent: 'videoqualitychange',
      event: 'videoqualitychanged',
      brokenEvent: 'qualitychangeerror'
    })
  }

  changeSource(source: Source | Promise<Source>, keepPlaying: boolean = true) {
    return this._loader(source, {
      keepPlaying,
      preEvent: 'videosourcechange',
      event: 'videosourcechanged',
      brokenEvent: 'sourcechangeerror'
    })
  }

  _loader(
    sourceLike: Source | Promise<Source>,
    options: {
      event: string
      preEvent: string
      brokenEvent: string
      keepPlaying: boolean
      keepTime?: boolean
    }
  ) {
    return new Promise<void>((resolve, reject) => {
      if (this.isSourceChanging) return reject(Error('Previous Source is Changing.'))
      const { isPlaying, currentTime, volume, playbackRate } = this

      this.pause()
      this.hasError = false
      this.isSourceChanging = true
      this.emit(options.preEvent, sourceLike)

      const { keepPlaying, keepTime } = options
      const isPreloadNone = this.options.preload == 'none'
      const canplay = isPreloadNone ? 'loadstart' : 'loadedmetadata'
      const shouldPlay = keepPlaying && isPlaying

      let finalSource: Source

      const errorHandler = (e: any) => {
        if (!this.$root) return
        this.off(canplay, canplayHandler)
        this.emit(options.brokenEvent, finalSource || sourceLike)
        if (options.event == 'videosourcechanged') {
          this.isSourceChanging = false
        } else {
          this.load(this.options.source)
            .then(rollback)
            .finally(() => {
              this.isSourceChanging = false
            })
        }
        reject(e)
      }

      const rollback = () => {
        if (volume != this.volume) this.setVolume(volume)
        if (playbackRate != this.playbackRate) this.setPlaybackRate(playbackRate)
        if (isPreloadNone && keepTime) this.$video.load()
        if (keepTime && !this.options.isLive) this.seek(currentTime)
        if (shouldPlay && !this.isPlaying) this.$video.play()
        Object.assign(this.options.source, finalSource)
      }

      const canplayHandler = () => {
        if (!this.$root) return
        this.off('error', errorHandler)
        rollback()
        this.isSourceChanging = false
        this.emit(options.event, finalSource)
        resolve()
      }

      return (sourceLike instanceof Promise ? sourceLike : Promise.resolve(sourceLike))
        .then((source) => {
          if (!source.src) throw new Error('Empty Source')
          finalSource = source
          this.$video.poster = source.poster || ''

          this.once('error', errorHandler)
          this.once(canplay, canplayHandler)

          return source
        })
        .then((source) => this.load(source))
        .catch(errorHandler)
    })
  }

  destroy() {
    Player.players.splice(Player.players.indexOf(this), 1)

    const { eventEmitter, loader, plugins, container, $root, $video, isPlaying, isFullScreen, isInPip } = this

    eventEmitter.emit('destroy')
    eventEmitter.offAll()

    loader?.destroy()
    plugins.forEach((it) => !it.load && it.destroy?.())

    if (isPlaying) this.pause()
    if (isFullScreen) this.exitFullscreen()
    if (isInPip) this.exitPip()
    if ($video.src) URL.revokeObjectURL($video.src)

    container.removeChild($root)
    // prettier-ignore
    this.eventEmitter = this.locales = this.options = this.listeners = this.context = this.plugins = this.container = this.$root = this.$video = this.loader = undefined as any
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

if (globalThis.window) {
  console.log(
    '%cOPlayer%c v%s\n %c\nOh! Another HTML5 video player.\nhttps://github.com/shiyiya/oplayer\n',
    'font-size:32px;',
    'font-size:12px;color:#999999;',
    Player.version,
    'font-size:14px;'
  )
}
