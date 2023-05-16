// https://stackoverflow.com/questions/56934826/distinguish-between-ipad-and-mac-on-ipad-with-ipados
// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
export const isiPad =
  /(iPad)/gi.test(globalThis.navigator?.userAgent) || // chrome
  (/Macintosh/i.test(globalThis.navigator?.userAgent) && // safari  - iPad on iOS 13 detection
    Boolean(globalThis.navigator?.maxTouchPoints) &&
    globalThis.navigator?.maxTouchPoints >= 1)

export const isiPhone = /iPhone/gi.test(globalThis.navigator?.userAgent)

export const isSafari = /^((?!chrome|android).)*safari/i.test(globalThis.navigator?.userAgent)

export const isIOS = isiPhone || isiPad // not include Mac

// https://stackoverflow.com/questions/3007480/determine-if-user-navigated-from-mobile-safari
// export const isMobileSafari = isIOS && !/CriOS/i.test(globalThis.navigator?.userAgent)

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(
    globalThis.navigator?.userAgent
  ) || isIOS

export const isQQBrowser =
  /mqqbrowser/i.test(globalThis.navigator?.userAgent) &&
  !/ qq/i.test(globalThis.navigator?.userAgent)
