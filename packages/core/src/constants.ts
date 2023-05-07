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
  'waitingforkey',
  'enterpictureinpicture',
  'leavepictureinpicture'
] as const

export const PLAYER_EVENTS = ['contextmenu'] as const

export const OH_EVENTS = [
  'loadedplugin',
  'videoqualitychange',
  'videosourcechange',
  // 'posterchange',
  'destroy'
] as const

export const EVENTS = [...VIDEO_EVENTS, ...PLAYER_EVENTS, ...OH_EVENTS] as const
