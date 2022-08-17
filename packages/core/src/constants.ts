import { Source } from './types'

export enum VideoEvents {
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
  'encrypted',
  'waitingforkey'
}

export enum PlayerEvents {
  'pluginloaded',
  'pluginerror',
  'videosourcechange',
  'destroy'
}

//TODO: combin enum
export enum Events {
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
  'encrypted',
  'waitingforkey',

  // $player
  'contextmenu',
  'fullscreenchange',
  'fullscreenerror',

  'pluginloaded',
  'pluginerror',
  'videosourcechange',
  'destroy'
}

export declare interface PlayerListeners {
  [Events.abort]: (event: Events.abort, data: Event) => void
  [Events.canplay]: (event: Events.canplay, data: Event) => void
  [Events.canplaythrough]: (event: Events.canplaythrough, data: Event) => void
  [Events.durationchange]: (event: Events.durationchange, data: Event) => void
  [Events.error]: (event: Events.error, data: Event) => void
  [Events.loadeddata]: (event: Events.loadeddata, data: Event) => void
  [Events.loadedmetadata]: (event: Events.loadedmetadata, data: Event) => void
  [Events.loadstart]: (event: Events.loadstart, data: Event) => void
  [Events.playing]: (event: Events.playing, data: Event) => void
  [Events.progress]: (event: Events.progress, data: Event) => void
  [Events.ratechange]: (event: Events.ratechange, data: Event) => void
  [Events.seeking]: (event: Events.seeking, data: Event) => void
  [Events.stalled]: (event: Events.stalled, data: Event) => void
  [Events.suspend]: (event: Events.suspend, data: Event) => void
  [Events.timeupdate]: (event: Events.timeupdate, data: Event) => void
  [Events.encrypted]: (event: Events.encrypted, data: Event) => void
  [Events.waitingforkey]: (event: Events.waitingforkey, data: Event) => void

  [Events.contextmenu]: (event: Events.contextmenu, data: Event) => void
  [Events.fullscreenchange]: (event: Events.fullscreenchange, data: Event) => void
  [Events.fullscreenerror]: (event: Events.fullscreenerror, data: Event) => void
  [Events.pluginloaded]: (event: Events.pluginloaded, data: { name: string }) => void
  [Events.pluginerror]: (
    event: Events.pluginerror,
    data: { type: string; message: string; [k: string]: any }
  ) => void
  [Events.videosourcechange]: (event: Events.videosourcechange, data: Source) => void
  [Events.destroy]: (event: Events.destroy) => void

  ['*']: (event: keyof typeof Events, data: any) => void
}
