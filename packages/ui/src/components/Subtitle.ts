import type { Player } from '@oplayer/core'
import { $, isIOS, isMobile } from '@oplayer/core'
import { Icons } from '../functions/icons'
import type { Setting, Subtitle as SubtitleConfig, SubtitleSource, UIInterface } from '../types'
import { assToVtt, srtToVtt, vttToBlob } from './Subtitle.utils'
import { clamp } from '../utils'
import { controllerHidden } from '../style'

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
  options!: SubtitleConfig & { source: SubtitleSource[] }

  $track?: HTMLTrackElement
  $iosTrack?: HTMLTrackElement
  $dom!: HTMLDivElement

  isShow = false
  currentSubtitle?: SubtitleSource

  constructor(
    public player: Player,
    public setting: any,
    public el: HTMLElement,
    options?: SubtitleConfig
  ) {
    if (!window.TextDecoder) {
      player.emit('notice', { text: player.locales.get('TextDecoder not supported') })
      return
    }

    this.setting = setting
    this.options = { source: [], ...options }

    this.processDefault()
    this.createContainer()

    this.load()
    this.loadSetting()

    this.player.on(['destroy', 'videosourcechange'], this.destroy.bind(this))
  }

  /**
   * change subtitle source
   * @deprecated use `changeSource`
   */
  updateSource(payload: SubtitleSource[]) {
    this.changeSource(payload)
  }

  changeSource(payload: SubtitleSource[]) {
    this.options.source = payload
    this.processDefault()

    this.load()
    this.loadSetting()
    this.player.emit('subtitlesourcechange', payload)
  }

  changeOffset() {
    const offset = this.currentSubtitle!.offset
    const cues = this.player.$video.textTracks[0]?.cues

    if (offset) {
      const duration = this.player.duration

      Array.from(cues || []).forEach((cue) => {
        cue.startTime = clamp(cue.startTime + offset, 0, duration)
        cue.endTime = clamp(cue.endTime + offset, 0, duration)
      })

      //ios
      if (this.$iosTrack) {
        Array.from(this.player.$video.textTracks[1]?.cues || []).forEach((cue) => {
          cue.startTime = clamp(cue.startTime + offset, 0, duration)
          cue.endTime = clamp(cue.endTime + offset, 0, duration)
        })
      }
    }
  }

  processDefault() {
    this.currentSubtitle = findDefault(this.options.source)
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
            transition: 'margin 0.2s',
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

  load() {
    if (!this.currentSubtitle) return
    if (!this.$track) this.createTrack()
    this.loadSubtitle()
      .then(() => {
        this.$track!.addEventListener(
          'load',
          () => {
            // wait video metadata loaded
            if (isNaN(this.player.duration)) {
              this.player.once('loadedmetadata', () => {
                this.changeOffset()
              })
            } else {
              this.changeOffset()
            }
            this.show()
          },
          { once: true }
        )
      })
      .catch((e) => {
        this.player.emit('notice', { text: (<Error>e).message })
      })
  }

  destroy() {
    const { $dom, $track, $iosTrack } = this
    $track?.removeEventListener('cuechange', this.update)
    $dom.innerHTML = ''
    this.setting.unregister(SETTING_KEY)
    if ($track?.src) URL.revokeObjectURL($track.src)
    if ($iosTrack?.src) URL.revokeObjectURL($iosTrack.src)
    $track?.remove()
    $iosTrack?.remove()
    this.$track = undefined
    this.$iosTrack = undefined
    this.isShow = false
  }

  update = () => {
    const { $dom, player } = this
    const activeCues = player.$video.textTracks[0]?.activeCues

    if (activeCues?.length) {
      let html = ''
      for (let i = 0; i < activeCues.length; i++) {
        const activeCue = activeCues[i] as VTTCue | undefined
        if (activeCue) {
          // TODO: FIX
          // "<b>Otomi, I don't see this \nfriend you said was here.</b>"
          // <p><span><b>xxx</b></span></p>
          // <p><b><span>xxx</span></b></p>
          html += activeCue.text
            .replaceAll(`\\h`, '')
            .split(/\r?\n/)
            .map((item: string) => `<p><span>${item}</span></p>`)
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

        switch (
          type == undefined || type == 'auto' ? /srt|ass|vtt(#|\?|$)/i.exec(src)?.[0] : type
        ) {
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
      this.setting.register(<Setting>{
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

function findDefault(o: SubtitleSource[]) {
  return o.find((st) => st.default)
}
