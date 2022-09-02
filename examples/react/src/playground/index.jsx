import React, { Component } from 'react'
import danmaku from '../../../../packages/danmaku/dist/index.es'
import ui from '../../../../packages/ui/dist/index.es'
import hls from '../../../../packages/hls/dist/index.es'

import { isMobile } from '../../../../packages/ui/src/utils'

import './reset.css'
import './defaults.scss'
import './range.scss'
import './index.scss'

import { version } from '../../../../packages/core/package.json'
import ReactPlayer from '../../../../packages/react/dist/index.es'

export function Duration({ className, seconds }) {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={className}>
      {format(seconds)}
    </time>
  )
}

function format(seconds) {
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = pad(date.getUTCSeconds())
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`
  }
  return `${mm}:${ss}`
}

function pad(string) {
  return ('0' + string).slice(-2)
}

const plugins = [
  hls(),
  danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml', fontSize: isMobile ? 0.6 : 1 }),
  ui({
    theme: { primaryColor: '#6668ab' },
    subtitle: [
      {
        name: '君の名は',
        default: true,
        url: 'https://oplayer.vercel.app/君の名は.srt'
      }
    ],
    thumbnails: { url: 'https://oplayer.vercel.app/thumbnails.jpg', number: 100 },
    highlight: [
      {
        time: 12,
        text: '谁でもいいはずなのに'
      },
      {
        time: 34,
        text: '夏の想い出がまわる'
      },
      {
        time: 58,
        text: 'こんなとこにあるはずもないのに'
      },
      {
        time: 88,
        text: '－－终わり－－'
      }
    ]
  })
]

// https://github.com/cookpete/react-player/tree/master/src/demo
class App extends Component {
  state = {
    url: null,
    pip: false,
    playing: true,
    light: false,
    volume: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false
  }

  load = (url) => {
    this.setState({
      url,
      played: 0,
      loaded: 0,
      pip: false
    })
  }

  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  handleStop = () => {
    this.setState({ url: null, playing: false })
  }

  handleToggleControls = () => {
    const url = this.state.url
    this.setState(
      {
        controls: !this.state.controls,
        url: null
      },
      () => this.load(url)
    )
  }

  handleToggleLoop = () => {
    this.setState({ loop: !this.state.loop })
  }

  handleVolumeChange = (e) => {
    this.setState({ volume: parseFloat(e.target.value) })
  }

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted })
  }

  handleSetPlaybackRate = (e) => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }

  handleOnPlaybackRateChange = (speed) => {
    this.setState({ playbackRate: parseFloat(speed) })
  }

  handleTogglePIP = () => {
    this.setState({ pip: !this.state.pip })
    this.player.togglePip()
  }

  handlePlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }

  handleEnablePIP = () => {
    console.log('onEnablePIP')
    this.setState({ pip: true })
  }

  handleDisablePIP = () => {
    console.log('onDisablePIP')
    this.setState({ pip: false })
  }

  handlePause = () => {
    console.log('onPause')
    this.setState({ playing: false })
  }

  handleSeekMouseDown = (e) => {
    this.setState({ seeking: true })
  }

  handleSeekChange = (e) => {
    this.setState({ played: parseFloat(e.target.value) })
  }

  handleSeekMouseUp = (e) => {
    this.setState({ seeking: false })
    this.player.seek(this.player.duration * e.target.value)
  }

  handleProgress = (state) => {
    console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  handleEnded = () => {
    console.log('onEnded')
    this.setState({ playing: this.state.loop })
  }

  handleDuration = (duration) => {
    console.log('onDuration', duration)
    this.setState({ duration })
  }

  handleClickFullscreen = () => {
    this.player.toggleFullScreen()
  }

  renderLoadButton = (url, label) => {
    return <button onClick={() => this.load(url)}>{label}</button>
  }

  ref = (player) => {
    if (!this.player && player) {
      this.player = player
      player.on('play', this.handlePlay)
      player.on('ended', this.handleEnded)
      player.on('error', (e) => console.log(e))
      player.on('progress', ({ payload }) => {
        this.handleProgress(payload)
      })
      player.on('durationchange', this.handleDuration)
      player.on('ratechange', this.handleOnPlaybackRateChange)
    }

    // onReady={() => console.log('onReady')}
    // onStart={() => console.log('onStart')}
    // onPlay={this.handlePlay}
    // onEnablePIP={this.handleEnablePIP}
    // onDisablePIP={this.handleDisablePIP}
    // onPause={this.handlePause}
    // onBuffer={() => console.log('onBuffer')}
    // onPlaybackRateChange={this.handleOnPlaybackRateChange}
    // onSeek={(e) => console.log('onSeek', e)}
    // onEnded={this.handleEnded}
    // onError={(e) => console.log('onError', e)}
    // onProgress={this.handleProgress}
    // onDuration={this.durationchange}
  }

  render() {
    const {
      url,
      playing,
      controls,
      light,
      volume,
      muted,
      loop,
      played,
      loaded,
      duration,
      playbackRate,
      pip
    } = this.state
    const SEPARATOR = ' · '

    return (
      <div className="app">
        <section className="section">
          <h1>ReactPlayer Demo</h1>
          <div className="player-wrapper">
            <ReactPlayer
              ref={this.ref}
              source={{ src: url }}
              playing={playing}
              playbackRate={playbackRate}
              muted={muted}
              /******************/
              /* un responsive */
              /*****************/
              loop={loop}
              volume={volume}
              plugins={plugins}
              /******************/
              /* un support */
              /*****************/
              pip={pip}
              controls={controls}
              light={light}
            />
          </div>

          <table>
            <tbody>
              <tr>
                <th>Files</th>
                <td>
                  {this.renderLoadButton(
                    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
                    'mp4'
                  )}
                  {this.renderLoadButton(
                    'https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm',
                    'webm'
                  )}
                  {this.renderLoadButton(
                    'https://filesamples.com/samples/video/ogv/sample_640x360.ogv',
                    'ogv'
                  )}
                  {this.renderLoadButton(
                    'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3',
                    'mp3'
                  )}
                  {this.renderLoadButton(
                    'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
                    'HLS (m3u8)'
                  )}
                  {this.renderLoadButton(
                    'http://dash.edgesuite.net/envivio/EnvivioDash3/manifest.mpd',
                    'DASH (mpd)'
                  )}
                </td>
              </tr>
              <tr>
                <th>Controls</th>
                <td>
                  <button onClick={this.handleStop}>Stop</button>
                  <button onClick={this.handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
                  <button onClick={this.handleClickFullscreen}>Fullscreen</button>
                  {light && <button onClick={() => this.player.showPreview()}>Show preview</button>}
                  <button onClick={this.handleTogglePIP}>
                    {pip ? 'Disable PiP' : 'Enable PiP'}
                  </button>
                </td>
              </tr>
              <tr>
                <th>Speed</th>
                <td>
                  <button onClick={this.handleSetPlaybackRate} value={1}>
                    1x
                  </button>
                  <button onClick={this.handleSetPlaybackRate} value={1.5}>
                    1.5x
                  </button>
                  <button onClick={this.handleSetPlaybackRate} value={2}>
                    2x
                  </button>
                </td>
              </tr>
              <tr>
                <th>Seek</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onMouseDown={this.handleSeekMouseDown}
                    onChange={this.handleSeekChange}
                    onMouseUp={this.handleSeekMouseUp}
                  />
                </td>
              </tr>
              <tr>
                <th>Volume</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={volume}
                    onChange={this.handleVolumeChange}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="controls">Controls</label>
                </th>
                <td>
                  <input
                    id="controls"
                    type="checkbox"
                    checked={controls}
                    onChange={this.handleToggleControls}
                  />
                  <em>&nbsp; Requires player reload</em>
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="muted">Muted</label>
                </th>
                <td>
                  <input
                    id="muted"
                    type="checkbox"
                    checked={muted}
                    onChange={this.handleToggleMuted}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="loop">Loop</label>
                </th>
                <td>
                  <input
                    id="loop"
                    type="checkbox"
                    checked={loop}
                    onChange={this.handleToggleLoop}
                  />
                </td>
              </tr>
              <tr>
                <th>url</th>
                <td className={!url ? 'faded' : ''} style={{ wordBreak: 'break-all' }}>
                  {(url instanceof Array ? 'Multiple' : url) || 'null'}
                </td>
              </tr>
              <tr>
                <th>Custom URL</th>
                <td>
                  <input
                    ref={(input) => {
                      this.urlInput = input
                    }}
                    type="text"
                    placeholder="Enter URL"
                  />
                  <button onClick={() => this.setState({ url: this.urlInput.value })}>Load</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="section" style={{ display: 'none' }}>
          <h2>State</h2>

          <table>
            <tbody>
              <tr>
                <th>playing</th>
                <td>{playing ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <th>volume</th>
                <td>{volume.toFixed(3)}</td>
              </tr>
              <tr>
                <th>speed</th>
                <td>{playbackRate}</td>
              </tr>
              <tr>
                <th>played</th>
                <td>{played.toFixed(3)}</td>
              </tr>
              <tr>
                <th>loaded</th>
                <td>{loaded.toFixed(3)}</td>
              </tr>
              <tr>
                <th>duration</th>
                <td>
                  <Duration seconds={duration} />
                </td>
              </tr>
              <tr>
                <th>elapsed</th>
                <td>
                  <Duration seconds={duration * played} />
                </td>
              </tr>
              <tr>
                <th>remaining</th>
                <td>
                  <Duration seconds={duration * (1 - played)} />
                </td>
              </tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <th>Custom URL</th>
                <td>
                  <input
                    ref={(input) => {
                      this.urlInput = input
                    }}
                    type="text"
                    placeholder="Enter URL"
                  />
                  <button onClick={() => this.setState({ url: this.urlInput.value })}>Load</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer className="footer">
          Version <strong>{version}</strong>
          {SEPARATOR}
          <a href="https://github.com/CookPete/react-player">GitHub</a>
          {SEPARATOR}
          <a href="https://www.npmjs.com/package/react-player">npm</a>
        </footer>
      </div>
    )
  }
}

export default App
