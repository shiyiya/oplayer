import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'

import { Player, isMobile, PlayerEvent } from '@oplayer/core'
import danmaku from '@oplayer/danmaku'
import dash from '@oplayer/dash'
import hls from '@oplayer/hls'
import mpegts from '@oplayer/mpegts'
import ui from '@oplayer/ui'
import torrent from '@oplayer/torrent'
import { PlaylistPlugin, Chromecast } from '@oplayer/plugins'

import vercel from '../../packages/docs/public/vercel.svg'

import emptyBuffer from './emptyBuffer'
import { highlight } from './constants'

interface Ctx {
  ui: ReturnType<typeof ui>
  hls: ReturnType<typeof hls>
  dash: ReturnType<typeof dash>
  mpegts: ReturnType<typeof mpegts>
  danmaku: ReturnType<typeof danmaku>
  playlist: PlaylistPlugin
}

const initialIndex = 0

const POSTER = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png`
const DANMAKU = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/danmaku.xml`
const THUMB = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/thumbnails.jpg`
const SRT = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/君の名は.srt`
const JPSRT = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/君の名は-jp.srt`
const SUPER_DANMAKU = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/天气之子.xml`
const FLV = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/op.flv`
const MP4 = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/君の名は.mp4`

const player = Player.make<Ctx>('#player', {
  // muted: true,
  volume: 0.5,
  // isLive: true,
  // autoplay: true,
  // preload: 'none',
  source: {
    // magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent
    src: '',
    poster: POSTER,
    title: '君の名は'
  },
  videoAttr: { crossorigin: 'anonymous' }, // screenshot
  lang: 'en'
  // isNativeUI: () => true
})
  .use([
    ui({
      theme: {
        watermark: {
          src: vercel,
          style: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '200px',
            height: 'auto'
          },
          attrs: {
            class: 'watermark',
            crossOrigin: 'anonymous'
          }
        },
        primaryColor: '#6668ab',
        progress: {},
        controller: {
          setting: 'auto',
          display: 'always',
          coverButton: true,
          displayBehavior: 'hover',
          header: { back: 'always' },
          slideToSeek: 'always'
        }
      },
      // autoFocus: true,
      keyboard: { global: true },
      screenshot: true,
      settings: ['loop'],
      pictureInPicture: true,
      // showControls: 'played',
      highlight: { color: 'pink' },
      subtitle: { background: true },
      icons: {
        progressIndicator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
        <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z"/>
        <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
        <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z"/>
    </svg>`
      }
    }),
    torrent(),
    hls({ forceHLS: true }),
    dash(),
    mpegts(),
    danmaku({
      enable: false,
      // displaySender: true,
      source: DANMAKU //SUPER_DANMAKU
    }),
    new PlaylistPlugin({
      initialIndex,
      sources: [
        {
          title: '君の名は - MP4',
          poster: POSTER,
          src: MP4,
          duration: '01:32',
          danmaku: SUPER_DANMAKU,
          thumbnails: {
            src: THUMB,
            number: 100
          },
          subtitles: [
            {
              name: 'Default',
              default: true,
              src: SRT, //'https://mentoor-st.s3.ir-thr-at1.arvanstorage.ir/media/courses/videos/a220374676eb40e4/001f4770a44497047661e446/subtitle/001f4770a44497047661e446_subtitle.srt', //SRT,
              offset: 2
            },
            {
              name: 'Japan',
              src: JPSRT,
              offset: 2
            }
          ],
          highlights: highlight
        },
        {
          title: 'HLS with default SRT subtitle',
          src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          poster: 'https://api.imlazy.ink/img?id19',
          subtitles: [
            {
              name: 'Default',
              default: true,
              src: SRT,
              offset: 2
            }
          ],
          duration: '10:34'
        },
        {
          title: 'BROKEN SOURCE & POSTER',
          src: '//',
          poster: '//',
          duration: '00:00'
        },
        {
          title: "Disney's Oceans - MP4",
          src: 'https://vjs.zencdn.net/v/oceans.mp4',
          poster: 'https://vjs.zencdn.net/v/oceans.png',
          duration: '00:46'
        },
        {
          title: 'Big Buck Bunny - HLS',
          src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          poster: 'https://d2zihajmogu5jn.cloudfront.net/big-buck-bunny/bbb.png',
          duration: '10:34'
        },
        {
          title: 'Big Buck Bunny - DASH',
          src: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
          poster: 'https://d2zihajmogu5jn.cloudfront.net/big-buck-bunny/bbb.png',
          duration: '10:34'
        },
        {
          title: 'FLV',
          src: FLV,
          duration: '00:17'
        },
        {
          title: 'webtorrent - MP4 + subtitle + poster',
          src: 'https://webtorrent.io/torrents/sintel.torrent',
          // 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
          poster: 'https://api.imlazy.ink/img?webtorrent'
        }
      ]
      // m3uList: {
      //   sourceFormat(info) {
      //     const chunk = info.title.substring(3).split(' ')
      //     const titleWith = chunk.find((it) => it.includes('title')).split('=')[1]
      //     const posterWith = chunk.find((it) => it.includes('logo'))?.split('=')[1]
      //     return {
      //       src: info.uri,
      //       format: 'm3u8',
      //       title: titleWith.substring(1, titleWith.length),
      //       poster: posterWith?.substring(1, posterWith.length)
      //     }
      //   }
      // },
    }),
    new Chromecast()
  ])
  .create()

function stopLoad() {
  player.loader?.destroy()
  const u8 = Uint8Array.from(emptyBuffer)
  player.$video.src = URL.createObjectURL(new Blob([u8.buffer]))
}

let src: string = player.context.playlist.options.sources[initialIndex].src

const actions = () =>
  html`<p style="display:flex;">
    <input type="text" @input=${(e: any) => (src = e.target.value)} style="width:100%;" .value=${live(src)} />

    <button @click=${() => player.changeSource({ src })}>Load</button>

    <button @click=${stopLoad}>StopLoad</button>
  </p> `

render(actions(), document.getElementById('actions')!)

player.on((e: PlayerEvent) => {
  render(actions(), document.getElementById('actions')!)

  if ('timeupdate' == e.type || 'notice' === e.type) {
    return
  }

  console.log(e)
})

render(
  html`
    <div>
      <h4>Oh-Player v${Player.version}</h4>
      <p>
        STAR ON <a target="_blank" href="https://github.com/shiyiya/oplayer">GitHub</a> |
        <a href="./script.html" target="_blank">SCRIPT DEMO</a>
      </p>
    </div>
  `,
  document.getElementById('meta')!
)

//@ts-ignore
window.player = player
