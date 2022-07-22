export const VIDEO_EVENTS = [
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
] as const

export const PLAYER_EVENTS = [
  'focus',
  'blur',
  'keydown',
  'keyup',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'touchstart',
  'touchend',
  'touchmove',
  'touchcancel',
  'contextmenu',
  'click',
  'dblclick',
  'fullscreenchange',
  'fullscreenerror'
] as const

export const OH_EVENTS = ['plugin:loaded', 'plugin:error', 'videosourcechange', 'destroy'] as const

export const EVENTS = [...VIDEO_EVENTS, ...PLAYER_EVENTS, ...OH_EVENTS] as const

// #regoin enum events

// enum _VIDEO_EVENTS {
//   'abort',
//   'canplay',
//   'canplaythrough',
//   'durationchange',
//   'emptied',
//   'ended',
//   'error',
//   'loadeddata',
//   'loadedmetadata',
//   'loadstart',
//   'pause',
//   'play',
//   'playing',
//   'progress',
//   'ratechange',
//   'seeked',
//   'seeking',
//   'stalled',
//   'suspend',
//   'timeupdate',
//   'volumechange',
//   'waiting',
//   'encrypted',
//   'waitingforkey'
// }

// enum _PLAYER_EVENTS {
//   'focus',
//   'blur',
//   'keydown',
//   'keyup',
//   'mousedown',
//   'mouseup',
//   'mousemove',
//   'mouseenter',
//   'mouseleave',
//   'touchstart',
//   'touchend',
//   'touchmove',
//   'touchcancel',
//   'contextmenu',
//   'click',
//   'dblclick',
//   'fullscreenchange',
//   'fullscreenerror'
// }

// enum _OH_EVENTS {
//   'videosourcechange'
// }

// export enum OH_ERRORS {
//   NETWORK_ERROR,
//   MEDIA_ERROR,
//   OTHER_ERROR
// }

// #endregoin

//todo: impl type declare
// export declare interface Listeners {
//   [_VIDEO_EVENTS.loadstart]: (type: string, payload: any) => void
//   [_PLAYER_EVENTS.blur]: () => void
//   [_OH_EVENTS.videosourcechange]: () => void
// }
