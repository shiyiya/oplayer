import type { Player } from './player'

export type Source = {
  src: string
  poster?: string
  format?: string
}

export type Options = {
  autoplay?: boolean //https://developer.chrome.com/blog/autoplay/
  muted?: boolean
  loop?: boolean
  volume?: number
  preload?: 'auto' | 'metadata' | 'none'
  playbackRate?: number
  playsinline?: boolean
  source: Source
}

export type PlayerPlugin = {
  name: string
  version?: string
  apply?: (player: Player) => void
  load?: (player: Player, video: HTMLVideoElement, src: Source) => boolean
}

export type OplayerEvent = {
  type: string
  payload: any
  _raw?: any
}

export type Listener = (enevt: OplayerEvent) => void
