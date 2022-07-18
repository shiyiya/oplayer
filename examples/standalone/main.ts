import Player, { VIDEO_EVENTS } from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'

import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'

//@ts-ignore
import poster from './poster.png'

const $container = document.getElementById('app')!
const $meta = document.getElementById('meta')!

const dataSrcs = [
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4',
  'https://ukzyvod3.ukubf5.com/20220410/yAU8vUFg/2000kb/hls/index.m3u8',
  'magnet:?xt=urn:btih:16E51415639B7A1F50AB99B4A0E7CE1DABD86712'
] as const

const querySrc = new URLSearchParams(window.location.search).get('src')
let src = querySrc || dataSrcs[0]
let currentDataSrcId = querySrc ? -1 : 0

const quailitySrcs = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
] as const

const p = Player.make($container, {
  volume: 0.1,
  autoplay: true,
  source: {
    src,
    poster: poster // 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use([ui({ theme: { primaryColor: '#ff69b4' } }), hls()])
  .create()

const meta = () => html`
  <h4>Oh-Player v${Player.version}</h4>
  <p>STAR ON <a target="_blank" href="https://github.com/shiyiya/oplayer">GitHub</a></p>

  <h4>Plugin used:</h4>
  <p>${p.plugins.map((plugin) => html`<li>${plugin}</li>`)}</p>

  <p>
    <input
      type="text"
      @input=${(e: any) => (src = e.target.value)}
      style="flex:1;"
      .value=${live(src)}
    />
  </p>
  <p><button @click=${() => p.changeSource({ src })}>ChangeSource</button></p>

  <p>
    <button
      @click=${() => {
        src =
          dataSrcs[
            currentDataSrcId + 1 >= dataSrcs.length
              ? (currentDataSrcId = 0)
              : (currentDataSrcId += 1)
          ]!
        p.changeSource({ src })
      }}
    >
      QueueSource
    </button>
  </p>
`

p.on((e) => {
  if (
    Object.values(VIDEO_EVENTS)
      .filter((_) => !['timeupdate', 'progress'].includes(_))
      .includes(e.type as any)
  ) {
    console.log(e)
    render(meta(), $meta)
  }
})

render(meta(), $meta)

console.log(p)
