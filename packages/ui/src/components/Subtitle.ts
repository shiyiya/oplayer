import type { Player } from '@oplayer/core'
import { $, isIOS, isMobile } from '@oplayer/core'
import { Icons } from '../functions/icons'
import type { Setting, Subtitle as SubtitleConfig, SubtitleSource } from '../types'
import { assToVtt, srtToVtt, vttToBlob } from './Subtitle.utils'

export default function (player: Player, el: HTMLElement, options?: SubtitleConfig) {
  return new Subtitle(player, el, options)
}

class Subtitle {
  options: SubtitleConfig

  $track?: HTMLTrackElement
  $iosTrack?: HTMLTrackElement
  $dom: HTMLDivElement

  isShow = false
  currentSubtitle?: SubtitleSource

  constructor(public player: Player, public el: HTMLElement, options?: SubtitleConfig) {
    if (!window.TextDecoder) {
      player.emit('notice', { text: player.locales.get('TextDecoder not supported') })
      return
    }

    this.options = options || { source: [] }

    this.processDefault()
    this.createContainer()
    this.initEvents()

    this.load()
    setTimeout(() => {
      this.loadSetting()
    })
  }

  processDefault() {
    this.currentSubtitle = findDefault(this.options.source)
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
        'font-size': `${(options.fontSize || (isMobile ? 14 : 16)) / 0.12}%`,

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

    if (isIOS) {
      this.$iosTrack = <HTMLTrackElement>$.render(
        $.create('track', {
          default: false,
          kind: 'captions'
        }),
        this.player.$video
      )
      this.player.$video.textTracks[1]!.mode = 'hidden'

      this.player.on('fullscreenchange', ({ payload }) => {
        if (payload.isWeb) return
        if (this.player.isFullScreen) {
          if (this.isShow) this.player.$video.textTracks[1]!.mode = 'showing'
        } else {
          this.player.$video.textTracks[1]!.mode = 'hidden'
        }
      })
    }
  }

  initEvents() {
    this.player.on(['destroy', 'videosourcechange'], this.destroy.bind(this))
  }

  updateSource(payload: SubtitleSource[]) {
    this.destroy()
    this.options.source = payload
    this.processDefault()
    this.loadSetting()
    this.load()
  }

  load() {
    if (!this.currentSubtitle) return
    if (!this.$track) this.createTrack()

    this.loadSubtitle()
      .then(() => this.show())
      .catch((e) => {
        this.player.emit('notice', { text: (<Error>e).message })
      })
  }

  destroy() {
    const { player, $dom, $track, $iosTrack } = this
    $track?.removeEventListener('cuechange', this.update)
    $dom.innerHTML = ''
    player.plugins.ui?.setting.unregister(SETTING_KEY)
    if ($track?.src) URL.revokeObjectURL($track.src)
    if ($iosTrack?.src) URL.revokeObjectURL($iosTrack.src)
    $track?.remove()
    $iosTrack?.remove()
    this.$track = undefined
    this.$iosTrack = undefined
  }

  update = (_: Event) => {
    const { $dom, player } = this
    const activeCues = player.$video.textTracks[0]?.activeCues

    if (activeCues?.length) {
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
      }
      $dom.innerHTML = html
    } else {
      $dom.innerHTML = ''
    }
  }

  show() {
    this.isShow = true
    this.$track!.addEventListener('cuechange', this.update)
  }

  hide() {
    const { $track, $dom } = this

    this.isShow = false
    $dom.innerHTML = ''
    $track!.removeEventListener('cuechange', this.update)
  }

  loadSubtitle() {
    const { currentSubtitle, player, $track, $iosTrack } = this
    const { src, encoding, type } = currentSubtitle!

    return fetch(src)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder(encoding)
        const text = decoder.decode(buffer)

        switch (type == undefined || type == 'auto' ? new URL(src).pathname.split('.')[1] : type) {
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
        if ($track?.src) URL.revokeObjectURL($track!.src)
        $track!.src = url

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
    const source = this.options.source

    if (source.length) {
      this.player.plugins.ui?.setting.register(<Setting>{
        name: this.player.locales.get('Subtitle'),
        type: 'selector',
        icon: Icons.get('subtitle'),
        key: SETTING_KEY,
        onChange: ({ value }) => {
          if (value) {
            this.currentSubtitle = value
            this.load()
          } else {
            this.hide()
          }
        },
        children: [
          {
            name: this.player.locales.get('OFF'),
            default: !this.currentSubtitle
          },
          ...source?.map((s) => ({
            name: s.name,
            default: this.currentSubtitle?.src == s.src,
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
