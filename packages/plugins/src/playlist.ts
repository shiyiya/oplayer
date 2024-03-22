import type { Player, Source, PlayerPlugin, PartialRequired } from '@oplayer/core'
import type { Highlight, SubtitleSource, Thumbnails, UIInterface } from '@oplayer/ui'

import './playlist.css'

interface Ctx {
  ui: UIInterface
  danmaku?: any
}

interface Segment {
  uri: string
  timeline: number
  title: string
}

export interface PlaylistOptions {
  sources?: PlaylistSource[]
  customFetcher?: (source: PlaylistSource, index: number) => Promise<PlaylistSource> | PlaylistSource
  autoNext?: boolean
  autoHide?: boolean
  initialIndex?: number
  m3uList?:
    | {
        sourceFormat?: (info: Segment) => Source
      }
    | true
}

export interface PlaylistSource extends Omit<Source, 'src'> {
  src?: string
  duration?: string
  subtitles?: SubtitleSource[]
  thumbnails?: Thumbnails
  highlights?: Highlight[]
  // see @oplayer/danmaku
  danmaku?: string | Function | any[]
}

export default class PlaylistPlugin implements PlayerPlugin {
  key = 'playlist'
  name = 'oplayer-plugin-playlist'
  version = __VERSION__

  //@ts-expect-error
  static m3u8Parser = globalThis.m3u8Parser

  player!: Player<Ctx>

  currentIndex?: number

  $root!: HTMLDivElement

  options: PartialRequired<PlaylistOptions, 'autoNext' | 'autoHide' | 'sources'>

  constructor(options?: PlaylistOptions) {
    this.options = Object.assign({ autoNext: true, autoHide: true, sources: [] }, options)
  }

  apply(player: Player) {
    if (player.isNativeUI) return

    this.player = player as Player<Ctx>

    this._init()

    return this
  }

  async _init() {
    const start = () => {
      this.render()
      if (typeof initialIndex == 'number') {
        this.changeSource(initialIndex)
      }
      if (this.options.autoNext) {
        this.player.on(['ended', 'error'], () => {
          this.next()
        })
      }
      this.player.context.ui.keyboard?.register({
        l: () => {
          this.$root.classList.toggle('playlist__active')
        }
      })
    }

    const { initialIndex, m3uList, sources } = this.options

    if (m3uList && sources[0]?.src) {
      //@ts-ignore
      if (!PlaylistPlugin.m3u8Parser) PlaylistPlugin.m3u8Parser = await import('m3u8-parser')
      fetch(sources[0].src)
        .then((resp) => resp.text())
        .then((manifest) => {
          const parser = new PlaylistPlugin.m3u8Parser.Parser()
          parser.push(manifest)
          parser.end()
          this.options.sources = parser.manifest.segments.map((seg: Segment) => {
            if ((<any>m3uList)?.sourceFormat) {
              return (<any>m3uList).sourceFormat(seg)
            }
            return { src: seg.uri, title: seg.title }
          })
          start()
        })
        .catch((err) => {
          this.player.emit('notice', { pluginName: this.name, text: 'Playlist' + (<Error>err).message })
        })
    } else {
      start()
    }
  }

  get isWaiting() {
    return this.$root.classList.contains('playlist__wait')
  }

  changeSource(idx: number) {
    if (!this.options.sources[idx] || this.isWaiting) return

    const $target = this.$root.querySelector(`.playlist-list-item[data-index='${idx}']`)

    this.$root.classList.add('playlist__wait')
    $target?.classList.add('playlist-source__progress')

    const source: PlaylistSource = this.options.sources[idx]!

    return new Promise<PlaylistSource>((resolve) => {
      if (!source.src && this.options.customFetcher) {
        resolve(this.options.customFetcher?.(source, idx))
        return
      }
      resolve(source)
    })
      .then((source) => {
        if (!source.src) {
          this.player.context.ui.notice('Empty Source')
          throw new Error('Empty Source')
        }

        const { src, poster, format, title, subtitles, thumbnails, highlights, danmaku } = source

        return this.player.changeSource({ src, poster, format, title }).then(() => {
          if (subtitles) {
            this.player.context.ui.subtitle.changeSource(subtitles)
          }
          if (thumbnails) {
            this.player.context.ui.changThumbnails(thumbnails)
          }
          if (highlights) {
            this.player.context.ui.changHighlightSource(highlights)
          }
          if (danmaku) {
            this.player.context.danmaku?.bootstrap(danmaku)
          }
        })
      })
      .then(() => {
        this.player.emit('playlistsourcechange', { source, id: idx })
        if (this.options.autoHide) {
          setTimeout(() => {
            this.hideUI()
          }, 300)
        }
      })
      .catch((error) => {
        this.player.emit('playlistsourceerror', { error, idx })
      })
      .finally(() => {
        this.currentIndex = idx
        this._updateHeader()

        this.$root.querySelector('.playlist-source__active')?.classList.remove('playlist-source__active')
        $target?.classList.add('playlist-source__active')
        setTimeout(() => {
          this.$root.classList.remove('playlist__wait')
          $target?.classList.remove('playlist-source__progress')
        }, 300)
      })
  }

  changeSourceList(sources: PlaylistSource[]) {
    this.options.sources = sources
    this.renderList(sources)
  }

  next() {
    this.changeSource((this.currentIndex || 0) + 1)
  }

  previous() {
    this.changeSource((this.currentIndex || 0) - 1)
  }

  showUI() {
    this.$root.classList.add('playlist__active')
  }

  hideUI() {
    this.$root.classList.remove('playlist__active')
  }

  render() {
    const $playlist = `
    <div class="playlist-head">
      <span class="playlist-head-title">${this.player.locales.get('PLAYLIST')}</span>
      <div class="playlist-back">${
        this.player.context.ui.icons.playlist ||
        `<svg viewBox="0 0 32 32"><path d="m 12.59,20.34 4.58,-4.59 -4.58,-4.59 1.41,-1.41 6,6 -6,6 z"></path></svg>`
      }</div>
    </div>
    <div class="playlist-list">
    </div>`

    this.$root = document.createElement('div')
    this.$root.innerHTML = $playlist
    this.$root.className = 'playlist'

    this.$root.onclick = (e) => {
      const target = e.target as HTMLDivElement

      if (target.classList.contains('playlist-list-item')) {
        this.changeSource(+target.getAttribute('data-index')!)
      } else if (
        target.classList.contains('playlist-back') ||
        (target == this.$root && target.classList.contains('playlist__active'))
      ) {
        this.hideUI()
      }
    }

    this.renderList(this.options.sources)
    this.player.context.ui.$root.appendChild(this.$root)

    this.player.context.ui.menu.register({
      name: 'Playlist',
      icon: `<svg style="transform: scale(1.2);" viewBox="0 0 1024 1024"><path d="M213.333333 426.666667h426.666667c23.466667 0 42.666667 19.2 42.666667 42.666666s-19.2 42.666667-42.666667 42.666667H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666667s19.2-42.666667 42.666666-42.666666z m0-170.666667h426.666667c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666666H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666666s19.2-42.666667 42.666666-42.666667z m0 341.333333h256c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666667H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666667s19.2-42.666667 42.666666-42.666667z m384 37.546667v180.48c0 16.64 17.92 26.88 32.426667 18.346667l150.613333-90.453334c13.653333-8.106667 13.653333-28.16 0-36.693333l-150.613333-90.453333a21.674667 21.674667 0 0 0-32.426667 18.773333z"></path></svg>`,
      position: 'top',
      onClick: () => {
        this.showUI()
        const list = this.$root.querySelector('.playlist-list')!
        const active = this.$root.querySelector<HTMLDivElement>('.playlist-source__active')
        if (active && list.scrollHeight > 0 && this.currentIndex) {
          list.scrollTo(0, active.offsetHeight * this.currentIndex)
        }
      }
    })
  }

  renderList(sources: PlaylistSource[]) {
    const child = sources
      .map(
        (source, idx) => `
  <div class="playlist-list-item" data-index="${idx}">
  <div class="playlist-list-item-thumb">
    ${
      source.poster
        ? `<img class="playlist-list-item-img" src="${source.poster}" alt="${
            source.title || ''
          }" loading="lazy" onerror="this.classList.add('playlist-list-item-img__error');"/>`
        : '<span>EMPTY</span>'
    }
    </div>

    <div class="playlist-list-item-desc">
      <p>${source.title}</p>
      ${source.duration ? `<span>${source.duration}</span>` : ''}
    </div>
  </div>`
      )
      .join('')

    this._updateHeader()
    this.$root.querySelector('.playlist-list')!.innerHTML = child
  }

  _updateHeader() {
    this.$root.querySelector('.playlist-head-title')!.textContent = `${this.player.locales.get(
      'PLAYLIST'
    )} (${this.currentIndex !== undefined ? `${this.currentIndex + 1}/` : ''}${this.options.sources.length})`
  }

  destroy() {
    this.currentIndex = undefined
    this.options.sources = []
    this.renderList([])
  }
}
