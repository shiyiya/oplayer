export enum VIDEO_EVENTS {
  LOADSTART = 'loadstart',
  LOADEDDATA = 'loadeddata',
  LOADEDMETADATA = 'loadedmetadata',
  CANPLAY = 'canplay',
  CANPLAYTHROUGH = 'canplaythrough',
  PLAY = 'play',
  PAUSE = 'pause',
  ENDED = 'ended',
  TIMEUPDATE = 'timeupdate',
  PROGRESS = 'progress',
  SEEKED = 'seeked',
  ERROR = 'error',
  VOLUMECHANGE = 'volumechange',
  RATECHANGE = 'ratechange',
  DURATIONCHANGE = 'durationchange',
  ABORT = 'abort',
  SEEKING = 'seeking',
  STALLED = 'stalled',
  SUSPENDs = 'suspends',
  WAITING = 'waiting'
}

export enum PLAYER_EVENTS {
  FOUCUS = 'focus',
  BLUR = 'blur',
  KEYDOWN = 'keydown',
  KEYUP = 'keyup',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'mouseup',
  MOUSEMOVE = 'mousemove',
  MOUSEENTER = 'mouseenter',
  MOUSELEAVE = 'mouseleave',
  TOUCHSTART = 'touchstart',
  TOUCHEND = 'touchend',
  TOUCHMOVE = 'touchmove',
  TOUCHCANCEL = 'touchcancel',
  CONTEXTMENU = 'contextmenu',
  CLICK = 'click',
  DBLCLICK = 'dblclick'
}

export declare interface Listeners {
  [VIDEO_EVENTS.LOADSTART]: (type: string, event: any, data: any) => void
}
