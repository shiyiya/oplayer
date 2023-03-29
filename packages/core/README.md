# OPlayer Core

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)

![](../../oplayer.png)

## Basic

```js
const player = Player.make('#player', {
  source: {
    title: '君の名は',
    src: '/君の名は.mp4',
    poster: '/poster.png'
  }
})
  .use([OUI()])
  .create()
```

## Full-Options (default value)

```js
Player.make('#player', {
  source: {
    title: '君の名は',
    src: '/君の名は.mp4',
    poster: '/poster.png',
    format: 'auto' // 'auto'  /** hls.js */ 'hls' |  'm3u8' |  /** dash.js */  'dash' |  'mpd' |  /** mpegts.js */  'flv' |  'm2ts' |  'mpegts' |
  },
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
})
```

## Methods

- Change source

```js
// just change source
player.changeSource({ src, poster })

// will keep time or play state
player.changeQuality({ src })

// also be a promise
player.changeSource(
  fetch('xxx').then((resp) => {
    // do anything
    return { src, poster }
  })
)
```

- Destroy player

```js
player.destroy()
```

- Others

```ts
class Player {
  container: HTMLElement
  options: Required<PlayerOptions>
  locales: I18n
  eventEmitter: EventEmitter
  _pluginsFactory: PlayerPlugin[]
  plugins: any
  $root: HTMLElement
  $video: HTMLVideoElement
  listeners: Record<(typeof EVENTS)[number] | 'fullscreenchange' | 'fullscreenerror', Function>
  hasError: boolean
  isSourceChanging: boolean
  loader?: Loader
  constructor(el: HTMLElement | string, options?: PlayerOptions | string)
  static make(el: HTMLElement | string, options?: PlayerOptions | string): Player
  use(plugins: PlayerPlugin[]): this
  create(): this
  initEvent(): void
  render(): void
  load(source: Source): Promise<Source>
  applyPlugins(): void
  on(
    name: PlayerEventName | PlayerListener,
    listener?: PlayerListener,
    options?: {
      once: boolean
    }
  ): this
  off(name: PlayerEventName, listener: PlayerListener): void
  offAny(name: PlayerEventName): void
  emit(name: PlayerEventName, payload?: PlayerEvent['payload']): void
  setPoster(poster: string): void
  play(): Promise<void> | undefined
  pause(): void
  togglePlay(): void | Promise<void>
  mute(): void
  unmute(): void
  toggleMute(): void
  setVolume(volume: number): void
  setPlaybackRate(rate: number): void
  seek(time: number): void
  setLoop(loop: boolean): void
  enterFullscreen(): Promise<void>
  exitFullscreen(): Promise<void>
  get isFullscreenEnabled(): any
  get isFullScreen(): boolean
  toggleFullScreen(): Promise<void>
  get isPipEnabled(): boolean
  enterPip(): Promise<PictureInPictureWindow>
  exitPip(): false | Promise<void>
  get isInPip(): boolean
  togglePip(): false | Promise<void> | Promise<PictureInPictureWindow>
  _resetStatus(): void
  changeQuality(source: Omit<Source, 'poster'> | Promise<Omit<Source, 'poster'>>): Promise<void>
  changeSource(source: Source | Promise<Source>, keepPlaying?: boolean): Promise<void>
  _loader(
    source: Source | Promise<Source>,
    options: {
      keepPlaying: boolean
      event: string
      keepTime?: boolean
    }
  ): Promise<void>
  destroy(): void
  get isNativeUI(): boolean
  get state(): number
  get isPlaying(): boolean
  get isMuted(): boolean
  get isEnded(): boolean
  get isLoop(): boolean
  get isAutoPlay(): boolean
  get duration(): number
  get buffered(): TimeRanges
  get currentTime(): number
  get volume(): number
  get playbackRate(): number
  get _requestFullscreen(): Element['requestFullscreen']
  get _exitFullscreen(): Document['exitFullscreen']
  static get version(): string
}
```

## Events

'abort' | 'canplay' | 'canplaythrough' | 'durationchange' | 'emptied' | 'ended' | 'error' | 'loadeddata' | 'loadedmetadata' | 'loadstart' | 'pause' | 'play' | 'playing' | 'progress' | 'ratechange' | 'seeked' | 'seeking' | 'stalled' | 'suspend' | 'timeupdate' | 'volumechange' | 'waiting' | 'encrypted' | 'waitingforkey' | 'enterpictureinpicture' | 'leavepictureinpicture' | 'fullscreenchange | 'fullscreenerror | 'loadedplugin | 'videoqualitychange' | 'videosourcechange' | 'destroy'

```js
const listener = (event) => {
  console.log(event)
}

// listen
player.on('play', listener)
// listen multiple event
player.on(['play', 'pause'], listener)

// only once
player.on('play', listener, { once: true })

// remove listener
player.off('play', listener)

// emit event
player.emit('cool', { msg: "It's pretty cool!" })
```

## Plugin

```js
class HelloPlugin {
  key = 'hello'
  name = 'oplayer-plugin-hello'
  version = 'v0.0.1'

  apply(player) {
    this.say()

    player.on('play', () => {
      console.log('enjoy the video!')
    })

    return this
  }

  say(who = this.name) {
    console.log(`hello! ${who}`)
  }

  destroy() {
    console.log('bye bye!')
  }
}

const player = Player.make('#player', {
  source: {
    title: '君の名は',
    src: '/君の名は.mp4',
    poster: '/poster.png'
  }
})
  .use([new HelloPlugin()])
  .create()

player.context.hello.say('world')
```
