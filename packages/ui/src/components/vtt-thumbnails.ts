import Player, { $ } from '@oplayer/core'
import type { Thumbnails } from '../types'

const noop = () => {}

export const vttThumbnailsCls = $.css(`
  position: absolute;
  left: 0;
  bottom: 12px;
  pointer-events: none;
  transform: translateX(-50%);
  background-position-y: center;
  display: none;`)

export default function (player: Player, container: HTMLElement, options?: Thumbnails) {
  if (!options) return { update: noop, hide: noop, init: noop }

  type Def = { start: number; end: number; css: any }

  let vttData = [] as Def[]
  let cache = {} as any
  let lastStyle: Def
  let isActive = false
  let src = options.src
  const $dom = $.render($.create(`div.${vttThumbnailsCls}`), container)

  $dom.style.width = (options?.width || 160) + 'px'
  $dom.style.height = (options?.height || 90) + 'px'

  const bootstrap = (src: string) => {
    fetch(src)
      .then((resp) => resp.text())
      .then((data) => {
        vttData = processVtt(data)
        isActive = true
        $dom.style.opacity = '1'
      })
  }

  if (options.src) bootstrap(options.src)

  player.on('videosourcechange', () => {
    isActive = false
    $dom.style.opacity = '0'
    vttData = []
    cache = {}
  })

  player.on('thumbnailssourcechange', ({ payload }) => {
    bootstrap(payload)
  })

  const processVtt = (data: string) => {
    const processedVtts = [] as Def[]
    const vttDefinitions = data.split(/[\r\n][\r\n]/i)

    vttDefinitions.forEach((vttDef) => {
      if (
        vttDef.match(
          /([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?( ?--> ?)([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?[\r\n]{1}.*/gi
        )
      ) {
        const vttDefSplit = vttDef.split(/[\r\n]/i)
        const vttTiming = isFinite(+vttDefSplit[0]!) ? vttDefSplit[1]! : vttDefSplit[0]!
        const vttImageDef = isFinite(+vttDefSplit[0]!) ? vttDefSplit[2]! : vttDefSplit[1]!

        const vttTimingSplit = vttTiming.split(/ ?--> ?/i)
        const vttTimeStart = vttTimingSplit[0]
        const vttTimeEnd = vttTimingSplit[1]
        const vttCssDef = getVttCss(vttImageDef!)

        processedVtts.push({
          start: getSecondsFromTimestamp(vttTimeStart!),
          end: getSecondsFromTimestamp(vttTimeEnd!),
          css: vttCssDef
        })
      }

      return processedVtts
    })

    return processedVtts
  }

  const getSecondsFromTimestamp = (timestamp: string) => {
    const timestampParts = deconstructTimestamp(timestamp)

    return (
      timestampParts.hours * (60 * 60) +
      timestampParts.minutes * 60 +
      timestampParts.seconds +
      timestampParts.milliseconds / 1000
    )
  }

  const deconstructTimestamp = (timestamp: string) => {
    const splitStampMilliseconds = timestamp.split('.')
    const timeParts = splitStampMilliseconds[0]!
    const timePartsSplit = timeParts.split(':')

    return {
      milliseconds: parseInt(splitStampMilliseconds[1]!, 10) || 0,
      seconds: parseInt(timePartsSplit.pop()!, 10) || 0,
      minutes: parseInt(timePartsSplit.pop()!, 10) || 0,
      hours: parseInt(timePartsSplit.pop()!, 10) || 0
    }
  }

  const getVttCss = (vttImageDef: string) => {
    const cssObj = {} as any

    if (!vttImageDef.match(/#xywh=/i)) {
      cssObj.background = 'url("' + mergeSrc(vttImageDef) + '")'
      return cssObj
    }

    const imageProps = getPropsFromDef(vttImageDef)

    cssObj.background =
      'url("' +
      mergeSrc(imageProps.image!) +
      '") no-repeat -' +
      imageProps.x +
      'px -' +
      imageProps.y +
      'px'
    cssObj.width = imageProps.w + 'px'
    cssObj.height = imageProps.h + 'px'
    cssObj.url = mergeSrc(imageProps.image!)

    return cssObj
  }

  const mergeSrc = (() => {
    const cache = {} as Record<string, string>
    return (path: string) => {
      if (cache[path]) return cache[path]
      if (/(https?:)?\/\//.test(path)) return path

      let plain = src
      if (/(https?:)?\/\//.test(path)) {
        plain = src.substring(0, src.indexOf('?') || undefined)
      }

      const i = plain.lastIndexOf('/')
      if (plain.startsWith('https://') && i < 8) return src + path
      if (plain.startsWith('http://') && i < 7) return src + path

      const fileName = plain.substring(i + 1) // 不包含 '/'
      cache[path] = src.replace(fileName, path)

      return cache[path]
    }
  })()

  const getPropsFromDef = (def: string) => {
    const imageDefSplit = def.split(/#xywh=/i)
    const imageUrl = imageDefSplit[0]
    const imageCoords = imageDefSplit[1]!
    const splitCoords = imageCoords.match(/[0-9]+/gi)!

    return {
      x: splitCoords[0],
      y: splitCoords[1],
      w: splitCoords[2],
      h: splitCoords[3],
      image: imageUrl
    }
  }

  const updateThumbnailStyle = (percent: number) => {
    if (!isActive) return
    const duration = player.duration
    const time = percent * duration
    const currentStyle = getStyleForTime(time)

    if (!currentStyle) {
      $dom.style.opacity = '0'
      return
    }

    const width = container.clientWidth
    const xPos = percent * width
    const thumbnailWidth = parseInt(currentStyle.width, 10)
    const halfthumbnailWidth = thumbnailWidth >> 1
    const marginRight = width - (xPos + halfthumbnailWidth)
    const marginLeft = xPos - halfthumbnailWidth

    $dom.style.opacity = '1'
    if (marginLeft > 0 && marginRight > 0) {
      $dom.style.transform = 'translateX(' + (xPos - halfthumbnailWidth) + 'px)'
    } else if (marginLeft <= 0) {
      $dom.style.transform = 'translateX(' + 0 + 'px)'
    } else if (marginRight <= 0) {
      $dom.style.transform = 'translateX(' + (width - thumbnailWidth) + 'px)'
    }

    if (lastStyle && lastStyle === currentStyle) {
      return
    }

    lastStyle = currentStyle

    for (const style in currentStyle) {
      if (currentStyle.hasOwnProperty(style)) {
        $dom.style[style as any] = currentStyle[style]
      }
    }
  }

  const getStyleForTime = (time: number) => {
    for (let i = 0; i < vttData.length; ++i) {
      const item = vttData[i]!

      if (time >= item.start && time < item.end) {
        // Cache miss
        if (item.css.url && !cache[item.css.url]) {
          // eslint-disable-next-line no-undef
          const image = new Image()

          image.src = item.css.url
          cache[item.css.url] = image
        }

        return item.css
      }
    }
  }

  return {
    init: () => {},
    update: updateThumbnailStyle
  }
}
