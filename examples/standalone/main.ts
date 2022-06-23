import Player, { VIDEO_EVENTS } from '@oplayer/core'
import hls from '@oplayer/core/plugins/hls'
import ui from '@oplayer/ui'
import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'

//@ts-ignore
import poster from './poster.png'
import '@oplayer/ui/dist/style.css'

const $container = document.getElementById('app')!
const $meta = document.getElementById('meta')!

const dataSrcs = [
  'https://ukzyvod3.ukubf5.com/20220410/yAU8vUFg/2000kb/hls/index.m3u8',
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
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
  .use([ui(), hls])
  .create()

const meta = () => html`
  <b>Oh-Player v${Player.version} </b>
  <p>STAR ON <a target="_blank" href="https://github.com/shiyiya/oplayer">GitHub</a></p>

  <p>
    <input
      type="text"
      @input=${(e: any) => (src = e.target.value)}
      style="flex:1;"
      .value=${live(src)}
    />
  </p>
  <p>video type: ${new URL(src).pathname.split('.').pop()}</p>
  <button @click=${() => p.changeSource(src)}>ChangeSource</button>

  <p>
    <button
      @click=${() => {
        src =
          dataSrcs[
            currentDataSrcId + 1 >= dataSrcs.length
              ? (currentDataSrcId = 0)
              : (currentDataSrcId += 1)
          ]!
        p.changeSource(src)
      }}
    >
      QueueSource
    </button>
  </p>

  <p>
    Vol&nbsp;&nbsp;:
    <input
      type="range"
      @input=${(e: any) => p.setVolume(e.target.value)}
      min="0"
      max="1"
      step="0.1"
      .value=${live(p.isMuted ? 0 : p.volume)}
    />
  </p>
`

p.on((e) => {
  e.type != 'timeupdate' && console.log(e)
  if (Object.values(VIDEO_EVENTS).includes(e.type as any) && e.type != 'timeupdate') {
    render(meta(), $meta)
  }
})

render(meta(), $meta)

console.log(p)
