import type { Player } from '@oplayer/core'
import { $, isIOS, isMobile } from '@oplayer/core'
import subtitleSvg from '../icons/subtitles.svg?raw'
import type { Setting, Subtitle as SubtitleConfig, SubtitleSource } from '../types'
import { assToVtt, srtToVtt, vttToBlob } from './Subtitle.utils'

export default function (player: Player, el: HTMLElement, options: SubtitleConfig) {
  new Subtitle(player, el, options)
}

class Subtitle {
  isInitial = false
  $track: HTMLTrackElement
  $dom: HTMLDivElement
  currentSubtitle?: SubtitleSource

  options: SubtitleConfig

  constructor(public player: Player, public el: HTMLElement, options?: SubtitleConfig) {
    if (!window.TextDecoder) {
      player.emit('notice', { text: player.locales.get('TextDecoder not supported') })
      return
    }

    this.options = options || { source: [] }

    const { source, enabled } = this.options
    this.currentSubtitle = findDefault(source)

    if (!this.currentSubtitle && enabled) {
      this.currentSubtitle = source[0]!
      if (this.options.source[0]) {
        this.options.source[0].default = true
      }
    }

    if (this.currentSubtitle && enabled === undefined) {
      this.options.enabled = true
    }

    // Create the dom before the fragment is inserted into the dom
    this.createDom()
    this.loadSetting()
  }

  init() {
    this.isInitial = true
    this.initEvents()
    this.loadSubtitle()
    this.show()
  }

  createDom() {
    const { player, el, options } = this

    this.$dom = $.create(
      `div.${$.css({
        width: '95%',
        color: '#fff',
        left: '5%',
        'text-align': 'center',
        'pointer-events': 'none',
        'text-shadow':
          '1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000',

        position: 'absolute',
        bottom: isMobile ? '6px' : '50px',
        'line-height': '1.2',
        'font-size': `${options.fontSize || (isMobile ? 14 : 16)}px`,

        '& > p': { margin: 0 }
      })}`
    )
    $.render(this.$dom, el)

    this.$track = <HTMLTrackElement>$.render(
      $.create('track', {
        default: true,
        kind: isIOS() ? 'captions' : 'metadata'
      }),
      player.$video
    )
  }

  initEvents() {
    const { player, $dom, $track } = this
    player.on('destroy', () => {
      $dom.innerHTML = ''
      player.emit('removesetting', 'subtitle')
      $track.removeEventListener('cuechange', this.update)
      if ($track.src) URL.revokeObjectURL($track.src)
      $track.src = ''
    })
  }

  update = (_: Event) => {
    const { $dom, player } = this

    $dom.innerHTML = ''
    const activeCues = player.$video.textTracks[0]?.activeCues?.[0]
    if (activeCues) {
      //@ts-ignore
      $dom.innerHTML = activeCues.text
        ?.split(/\r?\n/)
        .map((item: string) => `<p>${item}</p>`)
        .join('')
    }
  }

  show() {
    const { player, $track } = this

    if (isIOS()) {
      player.$video.textTracks[0]!.mode = 'showing'
    } else {
      $track.addEventListener('cuechange', this.update)
    }
  }

  hide() {
    const { player, $track, $dom } = this

    if (isIOS()) {
      player.$video.textTracks[0]!.mode = 'hidden'
    } else {
      $dom.innerHTML = ''
      $track.removeEventListener('cuechange', this.update)
    }
  }

  loadSubtitle() {
    const { currentSubtitle, player, $track } = this
    const { src, encoding, type } = currentSubtitle! // 如果没有则不会调用

    fetch(src)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder(encoding)
        const text = decoder.decode(buffer)
        player.emit('loadedsubtitle', currentSubtitle)

        switch (type || new URL(src).pathname.split('.')[1]) {
          case 'srt':
            return vttToBlob(srtToVtt(text))
          case 'ass':
            return vttToBlob(assToVtt(text))
          case 'vtt':
            return vttToBlob(text)
          default:
            return src
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

  loadSetting() {
    const { source, enabled } = this.options

    if (source.length) {
      this.player.emit('addsetting', <Setting>{
        name: this.player.locales.get('Subtitle'),
        type: 'selector',
        icon: subtitleSvg,
        key: 'subtitle',
        onChange: ({ value }) => {
          if (value) {
            this.currentSubtitle = value
            if (this.isInitial) {
              this.loadSubtitle()
              this.show()
            } else {
              this.init()
            }
          } else {
            if (this.isInitial) this.hide()
          }
        },
        children: [
          { type: 'switcher', name: this.player.locales.get('OFF'), default: !enabled },
          ...source?.map((s) => ({
            type: 'switcher',
            name: s.name,
            default: enabled ? s.default : false,
            value: s
          }))
        ]
      })
    }
  }
}

function findDefault(o: SubtitleSource[]) {
  return o.find((st) => st.default)
}
