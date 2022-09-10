import type { Player } from '@oplayer/core'
import { $, isIOS, isMobile } from '@oplayer/core'
import subtitleSvg from '../icons/subtitles.svg?raw'
import type { Setting, Subtitle as SubtitleConfig, SubtitleSource } from '../types'
import { assToVtt, srtToVtt, vttToBlob } from './Subtitle.utils'

export default function (player: Player, el: HTMLElement, options: SubtitleConfig) {
  new Subtitle(player, el, options)
}

class Subtitle {
  options: SubtitleConfig

  $track: HTMLTrackElement
  $iosTrack: HTMLTrackElement
  $dom: HTMLDivElement

  isShow = false
  currentSubtitle?: SubtitleSource

  constructor(public player: Player, public el: HTMLElement, options?: SubtitleConfig) {
    if (!window.TextDecoder) {
      player.emit('notice', { text: player.locales.get('TextDecoder not supported') })
      return
    }

    this.options = options || { source: [] }

    const { source, enabled } = this.options
    this.currentSubtitle = findDefault(source)

    if (!this.currentSubtitle && enabled) {
      if (source[0]) {
        this.currentSubtitle = source[0]
        this.options.source[0]!.default = true
      }
    }

    if (this.currentSubtitle && enabled === undefined) {
      this.options.enabled = true
    }

    // Create the dom before the fragment is inserted into the dom
    this.createContainer()
    this.initEvents()
    this.loadSetting()
  }

  createContainer() {
    const { el, options } = this

    this.$dom = $.create(
      `div.${$.css({
        color: options.color ?? '#fff',
        left: '2%',
        right: '2%',
        'text-align': 'center',
        'pointer-events': 'none',
        'text-shadow':
          '1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000',

        position: 'absolute',
        bottom: `${options.bottom ?? '5%'}`,
        'line-height': '1.2',
        'font-size': `${options.fontSize || (isMobile ? 14 : 16)}px`,

        '& > p': { margin: 0 }
      })}`
    )

    $.render(this.$dom, el)
  }

  createTrack() {
    this.$track = <HTMLTrackElement>$.render(
      $.create('track', {
        default: true,
        kind: 'metadata'
      }),
      this.player.$video
    )

    if (isIOS()) {
      this.$iosTrack = <HTMLTrackElement>$.render(
        $.create('track', {
          default: false,
          kind: 'captions'
        }),
        this.player.$video
      )

      this.player.on('fullscreenchange', () => {
        if (this.player.isFullScreen) {
          if (this.isShow) this.player.$video.textTracks[1]!.mode = 'showing'
        } else {
          this.player.$video.textTracks[1]!.mode = 'hidden'
        }
      })
    }
  }

  initEvents() {
    const { player, $dom, $track, $iosTrack } = this
    player.on('destroy', () => {
      $dom.innerHTML = ''
      player.emit('removesetting', SETTING_KEY)

      $track?.removeEventListener('cuechange', this.update)
      if ($track.src) URL.revokeObjectURL($track.src)
      if ($iosTrack.src) URL.revokeObjectURL($iosTrack.src)
    })

    player.on('subtitlechange', ({ payload }) => {
      if (this.isShow) this.hide()
      player.emit('removesetting', SETTING_KEY)
      this.options.source = payload
      this.loadSetting()
    })
  }

  load() {
    this.loadSubtitle()
      .then(() => this.show())
      .catch((e) => {
        this.player.emit('notice', { text: (<Error>e).message })
      })
  }

  update = (_: Event) => {
    const { $dom, player } = this
    const activeCues = player.$video.textTracks[0]?.activeCues

    if (activeCues) {
      let html = ''
      for (let i = 0; i < activeCues.length; i++) {
        const activeCue = activeCues[i]

        if (activeCue) {
          //@ts-ignore
          html += activeCue.text
            ?.split(/\r?\n/)
            .map((item: string) => `<p>${item}</p>`)
            .join('')
        }

        $dom.innerHTML = ''
        $dom.innerHTML = html
      }
    }
  }

  show() {
    const { $track } = this
    this.isShow = true

    $track.addEventListener('cuechange', this.update)
  }

  hide() {
    const { $track, $dom } = this

    this.isShow = false
    $dom.innerHTML = ''
    $track.removeEventListener('cuechange', this.update)
  }

  loadSubtitle() {
    const { currentSubtitle, player, $track, $iosTrack } = this
    const { src, encoding, type } = currentSubtitle!

    return fetch(src)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder(encoding)
        const text = decoder.decode(buffer)

        let _type = type
        if (type == undefined || type == 'auto') _type = new URL(src).pathname.split('.')[1]

        switch (_type) {
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

        if ($iosTrack) {
          if ($iosTrack.src) URL.revokeObjectURL($iosTrack.src)
          $iosTrack.src = url
        }
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
        key: SETTING_KEY,
        onChange: ({ value }) => {
          if (!this.$track && value) this.createTrack()

          if (value) {
            this.currentSubtitle = value
            this.load()
          } else {
            this.hide()
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

const SETTING_KEY = 'Subtitle'

function findDefault(o: SubtitleSource[]) {
  return o.find((st) => st.default)
}
