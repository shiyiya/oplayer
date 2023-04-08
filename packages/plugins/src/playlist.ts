import type { Player, Source, PlayerPlugin, PartialRequired } from '@oplayer/core'
import type { SubtitleSource, Thumbnails, UIInterface } from '@oplayer/ui'

import './playlist.css'

interface Ctx {
  ui: UIInterface
}

export interface PlaylistOptions {
  sources: PlaylistSource[]
  onSourceChange?: (source: PlaylistSource) => Promise<void | PlaylistSource>
  autoNext?: boolean
  initialIndex?: number
}

export interface PlaylistSource extends Omit<Source, 'src'> {
  src?: string
  duration?: string
  subtitles?: SubtitleSource[]
  thumbnails?: Thumbnails
}

export default class PlaylistPlugin implements PlayerPlugin {
  key = 'playlist'
  name = 'oplayer-plugin-playlist'

  player: Player<Ctx>

  currentIndex: number = 0

  $root: HTMLDivElement

  options: PartialRequired<PlaylistOptions, 'autoNext' | 'initialIndex'>

  constructor(options: PlaylistOptions) {
    this.options = Object.assign({ autoNext: true, initialIndex: 0 }, options)
  }

  apply(player: Player) {
    this.player = player as Player<Ctx>
    this.render()

    if (this.options.autoNext) {
      this.player.on('ended', () => {
        this.next()
      })
    }

    this.changeSource(this.options.initialIndex)
  }

  changeSource(idx: number) {
    const source = this.options.sources[idx]
    if (!source) return
    const { src, poster, format, title, subtitles, thumbnails } = source
    if (src) {
      this.player.changeSource({ src, poster, format, title })
      if (subtitles) {
        this.player.context.ui.subtitle.changeSource(subtitles)
      }
      if (thumbnails) {
        this.player.context.ui.changThumbnails(thumbnails)
      }
    } else {
      this.options.onSourceChange?.(source)
    }

    this.currentIndex = idx
    this.$root.querySelector('.playlist-list-item.active')?.classList.remove('active')
    this.$root.querySelector(`.playlist-list-item[data-index='${idx}']`)?.classList.add('active')
  }

  next() {
    this.changeSource(this.currentIndex + 1)
  }

  previous() {
    this.changeSource(this.currentIndex + 1)
  }

  render() {
    const sources = this.options.sources
    const $playlist = `
    <div class="playlist-head">
      <span>PLAYLIST</span>
      <div class="playlist-back"><svg viewBox="0 0 32 32"><path d="m 12.59,20.34 4.58,-4.59 -4.58,-4.59 1.41,-1.41 6,6 -6,6 z"></path></svg></div>
    </div>
    <div class="playlist-list">
      ${sources
        .map(
          (source, idx) => `
        <div class="playlist-list-item" data-index="${idx}">
          <div class="playlist-list-item-thumb" style="background-image: url('${
            source.poster
          }');"></div>
          <div class="playlist-list-item-desc">
            <p>${source.title}</p>
            ${source.duration ? `<span>${source.duration}</span>` : ''}
          </div>
        </div>`
        )
        .join('')}
    </div>`

    this.$root = document.createElement('div')
    this.$root.innerHTML = $playlist
    this.$root.className = 'playlist'

    this.$root.onclick = (e) => {
      const target = e.target as HTMLDivElement

      if (target.classList.contains('playlist-list-item')) {
        this.changeSource(+target.getAttribute('data-index')!)
      } else if (target.classList.contains('playlist-back')) {
        this.$root.classList.remove('active')
      } else if (target == this.$root && target.classList.contains('active')) {
        target.classList.remove('active')
      }
    }

    this.player.context.ui.$root.appendChild(this.$root)

    this.player.context.ui.menu.register({
      name: 'Playlist',
      icon: `<svg style=" transform: scale(1.2);" viewBox="0 0 1024 1024"><path d="M213.333333 426.666667h426.666667c23.466667 0 42.666667 19.2 42.666667 42.666666s-19.2 42.666667-42.666667 42.666667H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666667s19.2-42.666667 42.666666-42.666666z m0-170.666667h426.666667c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666666H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666666s19.2-42.666667 42.666666-42.666667z m0 341.333333h256c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666667H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666667s19.2-42.666667 42.666666-42.666667z m384 37.546667v180.48c0 16.64 17.92 26.88 32.426667 18.346667l150.613333-90.453334c13.653333-8.106667 13.653333-28.16 0-36.693333l-150.613333-90.453333a21.674667 21.674667 0 0 0-32.426667 18.773333z"></path></svg>`,
      position: 'top',
      onClick: () => {
        this.$root.classList.toggle('active')
      }
    })
  }

  destroy() {}
}
