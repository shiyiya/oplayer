import type { Player, Source } from '@oplayer/core'
import { PlayerPlugin } from '@oplayer/core'
import './playlist.css'

export interface PlaylistOptions {
  sources: (Source & { duration?: number; subtitles: []; thumbnails: {} })[]
}

export default class PlaylistPlugin implements PlayerPlugin {
  key = 'playlist'
  name = 'oplayer-plugin-playlist'

  player: Player

  constructor(public options: PlaylistOptions) {}

  apply(player: Player) {
    this.player = player
    this.render()
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
          <div class="playlist-list-item-thumb" style="background-image: url('${source.poster}');"></div>
          <div class="playlist-list-item-desc">
            <p>${source.title}</p>
            <span>${source.duration}</span>
          </div>
        </div>`
        )
        .join('')}
    </div>`

    const wrap = document.createElement('div')
    wrap.innerHTML = $playlist
    wrap.className = 'playlist active'

    wrap.onclick = (e) => {
      const target = e.target as HTMLDivElement

      if (target.classList.contains('playlist-list-item')) {
        this.player.changeSource(sources[+target.getAttribute('data-index')!])
        wrap.querySelector('.playlist-list-item.active')?.classList.remove('active')
        target.classList.add('active')
      } else if (target.classList.contains('playlist-back')) {
        wrap.classList.remove('active')
      } else if (target == wrap && target.classList.contains('active')) {
        target.classList.remove('active')
      }
    }

    this.player.context.ui.$root.appendChild(wrap)

    this.player.context.ui.menu.register({
      name: 'playlist',
      icon: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1548" data-spm-anchor-id="a313x.7781069.0.i1" width="200" height="200"><path d="M213.333333 426.666667h426.666667c23.466667 0 42.666667 19.2 42.666667 42.666666s-19.2 42.666667-42.666667 42.666667H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666667s19.2-42.666667 42.666666-42.666666z m0-170.666667h426.666667c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666666H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666666s19.2-42.666667 42.666666-42.666667z m0 341.333333h256c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666667H213.333333c-23.466667 0-42.666667-19.2-42.666666-42.666667s19.2-42.666667 42.666666-42.666667z m384 37.546667v180.48c0 16.64 17.92 26.88 32.426667 18.346667l150.613333-90.453334c13.653333-8.106667 13.653333-28.16 0-36.693333l-150.613333-90.453333a21.674667 21.674667 0 0 0-32.426667 18.773333z"></path></svg>`,
      position: 'top',
      onClick() {
        wrap.classList.toggle('active')
      }
    })
  }

  destroy() {}
}
