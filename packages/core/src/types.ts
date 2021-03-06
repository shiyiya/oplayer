import type { Player } from './player'

export type Source = {
  src: string
  poster?: string
  format?: string
}

export type PlayerOptions = {
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

export type PlayerEvent = {
  type: string
  payload: any
  _raw?: any
}

export type PlayerListener = (enevt: PlayerEvent) => void
