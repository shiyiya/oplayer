import type { Player } from '@oplayer/core'
import { $, PlayerEvent, isIOS, isMobile } from '@oplayer/core'
import subtitleSvg from '../icons/subtitles.svg?raw'
import type { Setting, Subtitle, UiConfig } from '../types'
import { assToVtt, srtToVtt, vttToBlob } from './Subtitle.utils'

function findDefault(o: any) {
  return o?.find((st: any) => st.default) || o?.[0]
}

const render = (player: Player, el: HTMLElement, { subtitle = [] }: UiConfig) => {
  const defaultSubtitle = findDefault(subtitle)
  if (!defaultSubtitle || !window.TextDecoder) return

  const $dom = $.create(
    `div.${$.css({
      width: '95%',
      color: '#fff',
      left: '5%',
      'text-align': 'center',
      'pointer-events': 'none',
      'text-shadow':
        '1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000',

      'font-size': isMobile ? '1em' : '20px',
      position: 'absolute',
      bottom: isMobile ? '6px' : '50px',
      'line-height': '1.2',

      '& > p': { margin: 0 }
    })}`
  )
  $.render($dom, el)

  const $track = <HTMLTrackElement>$.render(
    $.create('track', {
      default: true,
      kind: isIOS() ? 'captions' : 'metadata'
    }),
    player.$video
  )

  const showsubtitle = () => {
    if (isIOS()) {
      player.$video.textTracks[0]!.mode = 'showing'
    } else {
      $track.addEventListener('cuechange', update)
    }
  }

  const hiddensubtitle = () => {
    if (isIOS()) {
      player.$video.textTracks[0]!.mode = 'hidden'
    } else {
      $dom.innerHTML = ''
      $track.removeEventListener('cuechange', update)
    }
  }

  player.on(['videosourcechange', 'destroy'], () => {
    $dom.innerHTML = ''
    player.emit('removesetting', 'subtitle')
    $track.removeEventListener('cuechange', update)
    if ($track.src) URL.revokeObjectURL($track.src)
    $track.src = ''
  })

  player.on('subtitlechange', ({ payload }: PlayerEvent) => {
    player.emit('removesetting', 'subtitle')
    initSetting(payload)
  })

  initSetting(subtitle)

  function initSetting(subtitle: Subtitle[]) {
    if (subtitle.length) {
      player.emit('addsetting', <Setting>{
        name: player.locales.get('Subtitle'),
        type: 'selector',
        icon: subtitleSvg,
        key: 'subtitle',
        onChange({ value }) {
          if (value) {
            showsubtitle()
            initSubtitle(value)
          } else {
            hiddensubtitle()
          }
        },
        children: [
          { type: 'switcher', name: player.locales.get('OFF') },
          ...subtitle?.map((s) => ({
            type: 'switcher',
            name: s.name,
            default: s.default || false,
            value: s
          }))
        ]
      })
    }
  }

  function update() {
    $dom.innerHTML = ''

    const activeCues = player.$video.textTracks[0]?.activeCues?.[0]
    if (activeCues) {
      //@ts-ignore
      $dom.innerHTML = activeCues.text
        ?.split(/\r?\n/)
        .map((item: string) => `<p>${item}</p>`)
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
        player.emit('loadedsubtitle', subtitle)

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
        player.emit('notice', { text: 'Subtitle' + (<Error>err).message })
      })
  }
}

export default render
