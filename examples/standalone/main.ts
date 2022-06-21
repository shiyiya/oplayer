import Player from '../../packages/core/src/index'
import { html, render } from 'lit-html'
import { formatTime } from '../../packages/core/src/utils/time'

const p = Player.make(document.getElementById('app')!, {
  src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  //  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  poster: 'https://media.w3.org/2010/05/sintel/poster.png',
  volume: 0.1
}).create()

const meta = () => html`
  <p>
   <small> ${formatTime(p.currentTime)} / ${formatTime(p.duration)}</small> &nbsp; &nbsp;
    <progress value=${p.currentTime} max=${p.duration}></progress>
    <progress value=${p.buffered.length ? p.buffered.end(0) : 0} max=${p.duration}></progress>
   ${p.isLoading ? 'loading' : ''}
  </p>

  <p>
    seek:
    <input
      type="range"
      @input=${(e) => p.seek(e.target.value)}
      min="0"
      max=${p.duration}
      step="0.1"
      value=${p.currentTime}
    />

    Volume:
    <input
      type="range"
      @input=${(e) => p.setVolume(e.target.value)}
      min="0"
      max="1"
      step="0.1"
      value=${p.volume}
    />

    Rate:
    <input
      type="range"
      @input=${(e) => p.setPlaybackRate(e.target.value)}
      min="0.5"
      max="5"
      step="0.1"
      value=${p.playbackRate}
    />
  </p>

    <button @click=${() => p.togglePlay()}>${p.isPlaying ? 'Pause' : 'Play'}</button>
    <button @click=${() => p.toggleFullScreen()}>requestFullscreen</button>
  </p>
`

p.on((e) => {
  console.log(e)

  render(meta(), document.getElementById('app')!)
})

render(meta(), document.getElementById('app')!)

console.log(p)
