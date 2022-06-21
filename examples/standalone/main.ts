import Player from '../../packages/core/src/index'
import { html, render } from 'lit-html'
import { formatTime } from '../../packages/core/src/utils/time'
import { PLAYER_EVENTS, VIDEO_EVENTS } from '../../packages/core/src/constants'
import hls from '../../packages/core/src/plugins/hls'

const $container = document.getElementById('app')!
const $meta = document.getElementById('meta')!

const dataSrcs = [
  'https://v.v1kd.com/20220507/AQzU93SJ/2000kb/hls/index.m3u8',
  'https://ukzyvod3.ukubf5.com/20220410/yAU8vUFg/2000kb/hls/index.m3u8',
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
    poster: 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use(hls)
  .create()

const meta = () => html`
  <p>
    <b>v${Player.version}</b>
    <input type="text" @input=${(e: any) => (src = e.target.value)} style="flex:1;" value=${src} />
    <span
      class="${p.isLoading && 'loading'}">
      ${p.isLoading ? '✳️' : p.isLoaded ? '✅' : '❌'}
    </span>
    <button @click=${() => p.changeSource(src)}>changeSource</button>
 </p>

 <p>
    <small> ${formatTime(p.currentTime)} / ${formatTime(p.duration)}</small>

    <progress value=${p.currentTime} max=${p.duration}></progress>

    buffered  &nbsp;
    <progress
      value=${p.buffered.length ? p.buffered.end(p.buffered.length - 1) : 0}
      max=${p.duration}></progress>


  </p>

  <p>
    seek:
    <input
      type="range"
      @input=${(e: any) => p.seek(e.target.value)}
      min="0"
      max=${p.duration}
      step="0.1"
      value=${p.currentTime}
    />

    Volume:
    <input
      type="range"
      @input=${(e: any) => p.setVolume(e.target.value)}
      min="0"
      max="1"
      step="0.1"
      value=${p.volume}
    />

    Rate:
    <input
      type="range"
      @input=${(e: any) => p.setPlaybackRate(e.target.value)}
      min="0.5"
      max="5"
      step="0.1"
      value=${p.playbackRate}
    />
  </p>

    <button @click=${() => p.togglePlay()}>${p.isPlaying ? 'Pause' : 'Play'}</button>
    <button @click=${() => p.toggleFullScreen()}>requestFullscreen</button>
    <button @click=${() => {
      src =
        dataSrcs[
          currentDataSrcId + 1 >= dataSrcs.length ? (currentDataSrcId = 0) : (currentDataSrcId += 1)
        ]!
      p.changeSource(src)
    }}>changeSource</button>

  </p>
`

p.on((e) => {
  if (Object.values(VIDEO_EVENTS).includes(e.type as any)) {
    console.log(e)
    render(meta(), $meta)
  }
})

p.on(PLAYER_EVENTS.CLICK, () => p.togglePlay())

render(meta(), $meta)

console.log(p)
