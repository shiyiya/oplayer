import { $, PlayerEvent } from '@oplayer/core'
import type { Player } from '@oplayer/core'
import { SnowConfig, Subtitle } from '../types'

function findDefault(o: any) {
  return o?.find((st: any) => st.default) || o?.[0]
}

const render = (player: Player, el: HTMLElement, { subtitle }: SnowConfig) => {
  const defaultSubtitle = findDefault(subtitle)
  if (!defaultSubtitle || !window.TextDecoder) return

  const $dom = $.create(
    `div.${$.css({
      width: '90%',
      'text-align': 'center',
      color: '#fff',
      'pointer-events': 'none',
      'text-shadow':
        '1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000',
      'font-size': '20px',
      position: 'absolute',
      bottom: '50px',
      left: '5%',

      ['@media only screen and (max-width: 991px)']: {
        '&': {
          'font-size': '1em',
          bottom: '6px'
        }
      }
    })}`,
    {}
  )
  $.render($dom, el)

  const $track = <HTMLTrackElement>$.render(
    $.create('track', {
      default: true,
      kind: 'metadata'
    }),
    player.$video
  )

  $track.addEventListener('cuechange', update)

  player.on('showsubtitle', () => {
    $track.addEventListener('cuechange', update)
  })

  //TODO: typescript: override event name
  //@ts-ignore
  player.on(['hiddensubtitle', 'videosourcechange'], () => {
    $dom.innerHTML = ''
    $track.removeEventListener('cuechange', update)
  })

  player.on('subtitlechange', ({ payload }: PlayerEvent) => {
    $dom.innerHTML = ''
    initSubtitle(payload)
  })

  player.on('videosourcechange', () => {
    player.emit('subtitleconfigchange', undefined)
  })

  player.on('subtitleconfigchange', ({ payload }: PlayerEvent) => {
    if (payload?.length) {
      initSubtitle(findDefault(payload))
    }
  })

  player.on('destroy', () => {
    if ($track.src) URL.revokeObjectURL($track.src)
    $track.removeEventListener('cuechange', update)
  })

  initSubtitle(defaultSubtitle)

  function update() {
    $dom.innerHTML = ''

    const activeCues = player.$video.textTracks[0]?.activeCues?.[0]
    if (activeCues) {
      //@ts-ignore
      $dom.innerHTML = activeCues?.text
        ?.split(/\r?\n/)
        .map((item: string) => `<p>${escape(item)}</p>`)
        .join('')

      player.emit('subtitleupdate')
    }
  }

  function initSubtitle(subtitle: Subtitle) {
    fetch(subtitle.url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder(subtitle.encoding)
        const text = decoder.decode(buffer)
        player.emit('subtitleloaded', subtitle)

        switch (subtitle.type || new URL(subtitle.url).pathname.split('.')[1]) {
          case 'srt':
            return vttToBlob(srtToVtt(text))
          case 'ass':
            return vttToBlob(assToVtt(text))
          case 'vtt':
            return vttToBlob(text)
          default:
            return subtitle.url
        }
      })
      .then((url) => {
        if ($track.src) URL.revokeObjectURL($track.src)
        $track.src = url
      })
      .catch((err) => {
        player.emit('notice', (<Error>err).message)
      })
  }
}

export default render

function fixSrt(srt: string) {
  return srt.replace(/(\d\d:\d\d:\d\d)[,.](\d+)/g, (_, $1, $2) => {
    let ms = $2.slice(0, 3)
    if ($2.length === 1) {
      ms = $2 + '00'
    }
    if ($2.length === 2) {
      ms = $2 + '0'
    }
    return `${$1},${ms}`
  })
}

function srtToVtt(srtText: string) {
  return 'WEBVTT \r\n\r\n'.concat(
    fixSrt(srtText)
      .replace(/\{\\([ibu])\}/g, '</$1>')
      .replace(/\{\\([ibu])1\}/g, '<$1>')
      .replace(/\{([ibu])\}/g, '<$1>')
      .replace(/\{\/([ibu])\}/g, '</$1>')
      .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
      .replace(/{[\s\S]*?}/g, '')
      .concat('\r\n\r\n')
  )
}

function vttToBlob(vttText: string) {
  return URL.createObjectURL(
    new Blob([vttText], {
      type: 'text/vtt'
    })
  )
}

function assToVtt(ass: string) {
  const reAss = new RegExp(
    'Dialogue:\\s\\d,' +
      '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +
      '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +
      '([^,]*),' +
      '([^,]*),' +
      '(?:[^,]*,){4}' +
      '([\\s\\S]*)$',
    'i'
  )

  function fixTime(time = '') {
    return time
      .split(/[:.]/)
      .map((item, index, arr) => {
        if (index === arr.length - 1) {
          if (item.length === 1) {
            return `.${item}00`
          }

          if (item.length === 2) {
            return `.${item}0`
          }
        } else if (item.length === 1) {
          return (index === 0 ? '0' : ':0') + item
        }

        return index === 0 ? item : index === arr.length - 1 ? `.${item}` : `:${item}`
      })
      .join('')
  }

  return `WEBVTT\n\n${ass
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(reAss)
      if (!m) return null
      return {
        start: fixTime(m[1]!.trim()),
        end: fixTime(m[2]!.trim()),
        text: m[5]!
          .replace(/{[\s\S]*?}/g, '')
          .replace(/(\\N)/g, '\n')
          .trim()
          .split(/\r?\n/)
          .map((item) => item.trim())
          .join('\n')
      }
    })
    .filter((line) => line)
    .map((line, index) => {
      if (line) {
        return `${index + 1}\n${line.start} --> ${line.end}\n${line.text}`
      }
      return ''
    })
    .filter((line) => line.trim())
    .join('\n\n')}`
}

function escape(str: string) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  )
}
