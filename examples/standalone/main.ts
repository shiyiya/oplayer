import Player from '../../packages/core/src/index'
import { html, render } from 'lit-html'
import { formatTime } from '../../packages/core/src/utils/time'
import { PLAYER_EVENTS, VIDEO_EVENTS } from '../../packages/core/src/constants'
import hls from '../../packages/core/src/plugins/hls'

const $container = document.getElementById('app')!
const $meta = document.getElementById('meta')!

let currentDataSrcId = 0
const dataSrcs = [
  'https://v.v1kd.com/20220507/AQzU93SJ/2000kb/hls/index.m3u8',
  'https://ukzyvod3.ukubf5.com/20220410/yAU8vUFg/2000kb/hls/index.m3u8',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4'
] as const

const quailitySrcs = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
] as const

const p = Player.make($container, {
  volume: 0.1,
  src: dataSrcs[0],
  autoplay: true,
  poster: 'https://media.w3.org/2010/05/sintel/poster.png'
})
  .use(hls)
  .create()

const meta = () => html`
  <p>
    <small> ${formatTime(p.currentTime)} / ${formatTime(p.duration)}</small>

    <progress value=${p.currentTime} max=${p.duration}></progress>

    buffered  &nbsp;
    <progress
      value=${p.buffered.length ? p.buffered.end(p.buffered.length - 1) : 0}
      max=${p.duration}></progress>

    loaded  &nbsp;
    <span
      class="${p.isLoading && 'loading'}">
      ${p.isLoading ? '✳️' : p.isLoaded ? '✅' : '❌'}
    </span>
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
      p.changeSource(
        dataSrcs[
          currentDataSrcId + 1 >= dataSrcs.length ? (currentDataSrcId = 0) : (currentDataSrcId += 1)
        ]!
      )
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
