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
  // 'focus',
  // 'keydown',
  // 'keyup',
  // 'mousedown',
  // 'mouseup',
  // 'mousemove',
  // 'mouseenter',
  // 'mouseleave',
  // 'touchstart',
  // 'touchend',
  // 'touchmove',
  // 'touchcancel',
  // 'click',
  // 'dblclick'
  'contextmenu',
  'fullscreenchange',
  'fullscreenerror'
] as const

export const OH_EVENTS = ['plugin:loaded', 'plugin:error', 'videosourcechange', 'destroy'] as const

export const EVENTS = [...VIDEO_EVENTS, ...PLAYER_EVENTS, ...OH_EVENTS] as const
