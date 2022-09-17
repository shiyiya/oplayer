// https://stackoverflow.com/questions/56934826/distinguish-between-ipad-and-mac-on-ipad-with-ipados
export const isiPad =
  /Macintosh/i.test(globalThis.navigator?.userAgent) &&
  Boolean(globalThis.navigator?.maxTouchPoints) &&
  globalThis.navigator?.maxTouchPoints > 2

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(
    globalThis.navigator?.userAgent
  ) || isiPad

export const isIOS = /(iPad|iPhone|iPod)/gi.test(globalThis.navigator?.userAgent)
