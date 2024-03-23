import type { PartialRequired, Player } from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { Icons } from '../functions/icons'
import type { Setting, Subtitle as SubtitleConfig, SubtitleSource, UIInterface } from '../types'
import { assToVtt, srtToVtt, vttToBlob } from './Subtitle.utils'
import { clamp } from '../utils'
import { controllerHidden } from '../style'

// TODO: support style & tag
// 00:03:31.485 --> 00:03:31.719 align:start position:0% line:0%
// <c.color96D2D3>Hey! nanika ga okoru spe cial </c><c.colorFEFEFE>night</c>

const SETTING_KEY = 'Subtitle'

export default function (it: UIInterface) {
  const {
    player,
    $root: el,
    config: { subtitle },
    setting
  } = it

  return (it.subtitle = new Subtitle(player, setting, el, subtitle))
}

export class Subtitle {
  options: PartialRequired<SubtitleConfig, 'source'>

  $dom: HTMLDivElement
  $track: HTMLTrackElement
  $iosTrack?: HTMLTrackElement

  isShow = false
  currentSubtitle?: SubtitleSource

  constructor(
    public player: Player,
    public setting: UIInterface['setting'],
    public el: HTMLElement,
    options?: SubtitleConfig
  ) {
    if (!window.TextDecoder) {
      player.emit('notice', { text: player.locales.get('TextDecoder not supported') })
      return
    }

    this.options = { source: [], ...options }
    this.processDefault(this.options.source)

    this.createContainer()
    this.fetchSubtitle()
    this.loadSetting()

    this.player.on(['destroy', 'videosourcechange'], this.destroy.bind(this))
    this.player.on('videoqualitychang', () => {
      if (this.isShow) this.hide()
    })
    this.player.on('videoqualitychanged', this.fetchSubtitle.bind(this))
  }

  changeSource(payload: SubtitleSource[]) {
    this.setting?.unregister(SETTING_KEY)
    this.processDefault(payload)
    const next = () => {
      this.loadSetting()
      this.player.emit('subtitlesourcechange', payload)
      this.fetchSubtitle()
    }
    if (this.player.isSourceChanging || isNaN(this.player.duration) || this.player.duration < 1) {
      this.player.once('loadedmetadata', next)
    } else {
      next()
    }
  }

  createContainer() {
    const {
      el,
      options: { color, shadow, fontSize, bottom, fontFamily, background, marginBottom }
    } = this

    this.$dom = $.create(
      `div.${$.css(
        Object.assign(
          {
            left: '2%',
            right: '2%',
            'text-align': 'center',
            'pointer-events': 'none',
            position: 'absolute',
            'line-height': '1.5',

            'font-family': fontFamily || 'inherit',
            color: color || '#fff',
            'text-shadow':
              shadow ||
              '1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000',
            bottom: bottom || '2%',
            'font-size': `${(fontSize || (isMobile ? 16 : 20)) / 16}em`,

            '& > p': {
              margin: 0,
              '& span': {
                'white-space': 'pre-wrap',
                background: background ? 'rgba(8, 8, 8, 0.75)' : 'inherit',
                padding: '0 0.25em'
              }
            }
          },
          !isMobile && {
            'margin-bottom': marginBottom || '2.2em',
            transition: 'margin 0.3s',
            [`@global .${controllerHidden} &`]: { 'margin-bottom': 0 }
          }
        )
      )}`,
      {
        'aria-label': 'Subtitle'
      }
    )

    $.render(this.$dom, el)
  }

  createTrack() {
    const { $video } = this.player

    this.$track = <HTMLTrackElement>$.render(
      $.create('track', {
        default: true,
        kind: 'metadata',
        id: 'primary'
      }),
      $video
    )

    // video fullscreen
    if (!this.player._requestFullscreen) {
      const { track } = (this.$iosTrack = $.create('track', {
        default: false,
        kind: 'captions',
        id: '__Orz__'
      }))

      track.mode = 'hidden'
      $.render(this.$iosTrack, $video)

      this.player.on('fullscreenchange', ({ payload }) => {
        if (payload.isWeb) return

        setTimeout(() => {
          const display = this.player.isFullScreen && this.isShow
          track.mode = display ? 'showing' : 'hidden'
        })
      })
    }
  }

  changeOffset() {
    const offset = this.currentSubtitle?.offset

    if (offset) {
      ;([this.$track, this.$iosTrack] as const).forEach(($track) => {
        if (!$track) return
        const cues = $track.track.cues
        const duration = this.player.duration

        Array.from(cues || []).forEach((cue) => {
          cue.startTime = clamp(cue.startTime + offset, 0, duration)
          cue.endTime = clamp(cue.endTime + offset, 0, duration)
        })
      })
    }
  }

  processDefault(payload: SubtitleSource[]) {
    this.options.source = payload
    this.currentSubtitle = findDefault(payload)
  }

  update = () => {
    let html = ''
    const activeCues = this.$track.track.activeCues
    if (activeCues?.length) {
      for (let i = 0; i < activeCues.length; i++) {
        const activeCue = activeCues[i] as VTTCue | undefined
        if (activeCue) {
          // TODO: FIX
          // "<b>Otomi, I don't see this \nfriend you said was here.</b>"
          // <p><span><b>xxx</b></span></p>
          // <p><b><span>xxx</span></b></p>
          html += activeCue.text
            .replace(/\\h/g, '&nbsp;')
            .split(/\r?\n/)
            .map((item: string) => `<p><span>${item}</span></p>`)
            .join('')
        }
      }
    }
    this.$dom.innerHTML = html
  }

  show() {
    this.isShow = true
    this.$track.addEventListener('cuechange', this.update)
  }

  hide() {
    const { $track, $dom } = this

    this.isShow = false
    $dom.innerHTML = ''
    $track.removeEventListener('cuechange', this.update)
  }

  fetchSubtitle() {
    if (!this.currentSubtitle) return
    if (!this.$track) this.createTrack()
    const { currentSubtitle, player, $track, $iosTrack } = this
    const { src, encoding, type = 'auto' } = currentSubtitle

    return fetch(src)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder(encoding)
        const text = decoder.decode(buffer)

        switch (type == 'auto' ? /srt|ass|vtt(#|\?|$)/i.exec(src)?.[0] : type) {
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
        if ($iosTrack?.src) URL.revokeObjectURL($iosTrack.src)

        this.$track.addEventListener(
          'load',
          () => {
            this.changeOffset()
            this.show()
          },
          { once: true }
        )

        $track.src = url
        $iosTrack && ($iosTrack.src = url)
      })
      .catch((err) => {
        player.emit('notice', { text: 'Subtitle' + (<Error>err).message })
      })
  }

  loadSetting() {
    if (!this.setting) return
    const source = this.options.source
    if (source.length) {
      this.setting.register(<Setting>{
        name: this.player.locales.get('Subtitle'),
        type: 'selector',
        icon: Icons.get('subtitle'),
        key: SETTING_KEY,
        onChange: ({ value }) => {
          if (value) {
            if (value.src == this.currentSubtitle?.src) {
              this.show()
            } else {
              this.currentSubtitle = value
              this.$dom.innerHTML = ''
              this.fetchSubtitle()
            }
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

  destroy() {
    const { $dom, $track, $iosTrack } = this
    $track?.removeEventListener('cuechange', this.update)
    this.setting?.unregister(SETTING_KEY)
    if ($track?.src) URL.revokeObjectURL($track.src)
    if ($iosTrack?.src) URL.revokeObjectURL($iosTrack.src)
    $track?.remove()
    $iosTrack?.remove()
    $dom.innerHTML = ''
    this.isShow = false
    this.$track = this.$iosTrack = undefined as any
  }
}

function findDefault(o: SubtitleSource[]) {
  return o.find((st) => st.default)
}
