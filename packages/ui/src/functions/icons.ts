import expandSvg from '../icons/fullscreen-enter.svg?raw'
import compressSvg from '../icons/fullscreen-exit.svg?raw'
import loopSvg from '../icons/loop.svg?raw'
import pauseSvg from '../icons/pause.svg?raw'
import pipEnterSvg from '../icons/pip-enter.svg?raw'
import pipExitSvg from '../icons/pip-exit.svg?raw'
import playSvg from '../icons/play.svg?raw'
import screenshotSvg from '../icons/screenshot.svg?raw'
import settingsSvg from '../icons/settings.svg?raw'
import volumeOffSvg from '../icons/sound-off.svg?raw'
import volumeSvg from '../icons/sound-on.svg?raw'
import speedSvg from '../icons/speed.svg?raw'
import subtitleSvg from '../icons/subtitles.svg?raw'
import qualitySvg from '../icons/quality.svg?raw'
import langSvg from '../icons/lang.svg?raw'

import type { UiConfig } from '../types'

export const ICONS_MAP = {
  play: playSvg,
  pause: pauseSvg,
  volume: [volumeSvg, volumeOffSvg],
  fullscreen: [expandSvg, compressSvg],
  pip: [pipEnterSvg, pipExitSvg],
  setting: settingsSvg,
  screenshot: screenshotSvg,
  playbackRate: speedSvg,
  subtitle: subtitleSvg,
  loop: loopSvg,
  progressIndicator: null,
  loadingIndicator: null,
  quality: qualitySvg,
  lang: langSvg,
  // plugins
  chromecast: null,
  airplay: null,
  danmaku: null,
  playlist: null,
  previous: null,
  next: null
}

export namespace Icons {
  export const setupIcons = (icons: UiConfig['icons']) => {
    for (const key in icons) {
      if (Object.prototype.hasOwnProperty.call(icons, key)) {
        ICONS_MAP[key as keyof UiConfig['icons']] = icons[key as keyof UiConfig['icons']]
      }
    }

    return ICONS_MAP
  }

  export const get = <K extends keyof typeof ICONS_MAP>(name: K): (typeof ICONS_MAP)[K] => ICONS_MAP[name]!
}
