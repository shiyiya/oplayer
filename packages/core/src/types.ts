import { EVENTS } from './constants'
import type { Player } from './player'

export type Source = {
  src?: string
  poster?: string
  title?: string
  format?: 'auto' | 'm3u8' | 'mpd' | 'flv' | 'm2ts' | 'mpegts' | string
}

export type Lang = 'auto' | 'zh' | 'zh-CN' | 'en'

export type PlayerOptions = {
  source?: Source
  autoplay?: boolean //https://developer.chrome.com/blog/autoplay/
  autopause?: boolean //Only allow one player playing at once.
  // ratio?: boolean //Force an aspect ratio for all videos. The format is 'w:h' - e.g. '16:9' or '4:3'. If this is not specified then the default for HTML5 and Vimeo is to use the native resolution of the video. As dimensions are not available from YouTube via SDK, 16:9 is forced as a sensible default.
  muted?: boolean
  loop?: boolean
  volume?: number
  playbackRate?: number
  playsinline?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  lang?: Lang
  isLive?: boolean
  videoAttr?: Record<string, boolean | string>
  isNativeUI?: () => boolean
}

export type PlayerPlugin = {
  name: string
  key?: string
  version?: string
  apply: (player: Player) => any
  load?: (player: Player, src: Source, options: { loader: boolean }) => boolean | Promise<boolean>
}

export type DefaultPlayerEvent = typeof EVENTS[number] | typeof EVENTS[number][]

export type PlayerEventName = DefaultPlayerEvent | string | string[]

export type PlayerEvent<T = any> = {
  type: PlayerEventName
  payload: T
}

export type PlayerListener = (event: PlayerEvent) => void

type FirstElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly [
  infer First,
  ...any
]
  ? First
  : unknown

type ExcludeFirstElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly [
  unknown,
  ...infer Rest
]
  ? Rest
  : unknown

export type ReturnTypePlugins<
  P extends readonly PlayerPlugin[],
  Result extends Record<string, any> = {}
> = FirstElement<P> extends PlayerPlugin
  ? ExcludeFirstElement<P> extends PlayerPlugin[]
    ? ReturnTypePlugins<ExcludeFirstElement<P>, Result & ReturnType<FirstElement<P>['apply']>>
    : Result & ReturnType<FirstElement<P>['apply']>
  : Result

// const p: PlayerPlugin = {
//   name: '11',
//   apply: () => ({
//     s: () => {
//       console.log('hi')
//     }
//   })
// }

// const ps = [p] as const

// not work 😭
// let a: ReturnTypePlugins<typeof ps> = 1 as any

// work 🤔️
// let c: ReturnTypePlugins<
//   [
//     {
//       name: '11'
//       apply: () => {
//         s: () => 1
//       }
//     }
//   ]
// > = 1 as any
