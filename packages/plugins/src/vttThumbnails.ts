import { PlayerPlugin } from '@oplayer/core'
import { $, Player } from '@oplayer/core'

type Thumbnails = {
  src: string
  prefix?: string
  width?: number
  height?: number
}

type Def = { start: number; end: number; css: any }

function plugin(player: Player, options?: Thumbnails) {
  const { $progress } = player.context.ui
  const container = $progress.firstElementChild

  let vttData = [] as Def[]
  let cache = {} as any
  let lastStyle: Def
  let isActive = false
  let src = options?.src
  const $dom = $.render($.create(`div.${player.context.ui.vttThumbnailsCls}`), container)

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
      .catch((err) => {
        player.emit('notice', { text: 'Failed to load vtt thumbnails', reason: err })
      })
  }

  if (options?.src) bootstrap(options.src)

  player.on('videosourcechange', () => {
    player.context.ui.progressHoverCallback.splice(
      player.context.ui.progressHoverCallback.findIndex((it: any) => it == updateThumbnailStyle),
      1
    )
    isActive = false
    $dom.style.opacity = '0'
    vttData = []
    cache = {}
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
      'url("' + mergeSrc(imageProps.image!) + '") no-repeat -' + imageProps.x + 'px -' + imageProps.y + 'px'
    cssObj.width = imageProps.w + 'px'
    cssObj.height = imageProps.h + 'px'
    cssObj.url = mergeSrc(imageProps.image!)

    return cssObj
  }

  const mergeSrc = (() => {
    const cache = {} as Record<string, string>
    return (path: string) => {
      if (!src) return path
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
      cache[path] = (options?.prefix || '') + src.replace(fileName, path)

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

  const updateThumbnailStyle = (percent?: number) => {
    if (!isActive || !percent) return
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

  player.context.ui.progressHoverCallback.push(updateThumbnailStyle)
  player.context.ui.changThumbnails = ({ src }: any) => bootstrap(src)
}

export default (options?: Thumbnails): PlayerPlugin => ({
  name: 'oplayer-vtt-thumbnails',
  version: __VERSION__,
  apply: (player) => plugin(player, options)
})
