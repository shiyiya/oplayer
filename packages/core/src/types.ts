import { EVENTS } from './constants'
import type { Player } from './player'

// TODO: multiple source
export type Source = {
  src: string
  poster?: string
  title?: string
  format?:
    | 'auto'
    /** hls.js */
    | 'hls'
    | 'm3u8'
    /** dash.js */
    | 'dash'
    | 'mpd'
    /** mpegts.js */
    | 'flv'
    | 'm2ts'
    | 'mpegts'
    /** other */
    | string
  type?: 'string' // video/mp4 video/webm
}

export type Lang = 'auto' | 'zh' | 'zh-CN' | 'en'

export interface PlayerOptions {
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

export interface Destroyable {
  destroy: () => void | Promise<void>
  [key: string]: any
}

export interface PlayerPlugin {
  name: string
  key?: string
  version?: string
  apply: (player: Player) => any
  destroy?: () => void | Promise<void>

  load?: (player: Player, src: Source) => false | Destroyable | Promise<false | Destroyable>
  unload?: () => void | Promise<void>
}

export type DefaultPlayerEvent = (typeof EVENTS)[number] | (typeof EVENTS)[number][]

export type PlayerEventName = DefaultPlayerEvent | string | string[]

export type PlayerEvent<T = any> = {
  type: PlayerEventName
  payload: T
}

export type PlayerListener = (event: PlayerEvent) => void

// make any to Required
export type PartialRequired<T, K extends keyof T> = {
  [P in K]-?: T[P]
} & Omit<T, K>

// make all Required then Partial any
export type RequiredPartial<T, K extends keyof T> = Required<Omit<T, K>> & {
  [P in K]?: T[P]
}
