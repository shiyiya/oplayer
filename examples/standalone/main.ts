import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'
import { ref } from 'lit/directives/ref.js'

import { Player, isMobile, PlayerEvent } from '@oplayer/core'
import danmaku from '@oplayer/danmaku'
import dash from '@oplayer/dash'
import hls from '@oplayer/hls'
import mpegts from '@oplayer/mpegts'
import ui from '@oplayer/ui'
import torrent from '@oplayer/torrent'

import DANMAKU from '../../website/static/danmaku.xml'
import POSTER from '../../website/static/poster.png'
import THUMB from '../../website/static/thumbnails.jpg'
import SRT from '../../website/static/君の名は.srt'
// import SUPER_DANMAKU from '../../website/static/天气之子.xml'
import FLV from '../../website/static/op.flv'
import MP4 from '../../website/static/君の名は.mp4'

import { MenuBar } from '@oplayer/ui/src/types'
import { FORMAT_MENU, highlight, VIDEO_LIST } from './constants'
import emptyBuffer from './emptyBuffer'
import { Hello, vttThumbnails, ad, PlaylistPlugin } from '@oplayer/plugins'
import gridThumb1 from '../../website/static/28627454.jpg'

interface Ctx {
  ui: ReturnType<typeof ui>
  hello: Hello
  hls: ReturnType<typeof hls>
  dash: ReturnType<typeof dash>
  mpegts: ReturnType<typeof mpegts>
  danmaku: ReturnType<typeof danmaku>
}

let src = VIDEO_LIST[0]!
let currentDataSrcId = 0

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
      controlBar: { back: 'always' },
      topSetting: isMobile,
      slideToSeek: 'always',
      // miniProgressBar: false,
      // autoFocus: true,
      keyboard: { global: true },
      // speed: [],
      screenshot: true,
      settings: ['loop'],
      pictureInPicture: true,
      // showControls: 'played',
      // theme: { primaryColor: '#00b2ff' },
      highlight: { color: '#000' },
      // subtitle: {
      //   source: [
      //     {
      //       name: 'Default',
      //       default: true,
      //       src: SRT,
      //       offset: 2
      //     }
      //   ]
      // },
      // thumbnails: {
      //   src: THUMB,
      //   number: 100
      // },
      icons: {
        progressIndicator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
        <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z"/>
        <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
        <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z"/>
    </svg>`,
        loadingIndicator: `<img style='max-height: 40%' src='https://user-images.githubusercontent.com/40481418/135559343-98e82c95-1a67-4083-8ecb-763f6e62577e.gif'/>`
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
    new Hello(),
    new PlaylistPlugin({
      initialIndex: 1,
      sources: [
        {
          title: '君の名は - MP4',
          poster: POSTER,
          src: MP4,
          duration: '01:32',
          thumbnails: {
            src: THUMB,
            number: 100
          },
          subtitles: [
            {
              name: 'Default',
              default: true,
              src: SRT,
              offset: 2
            }
          ],
          highlights: highlight
        },
        {
          title: 'Big Buck Bunny - HLS',
          src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          duration: '10:34',
          thumbnails: {
            src: [
              gridThumb1,
              // 'https://i0.hdslb.com/bfs/videoshot/28627454.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-1.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-2.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-3.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-4.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-5.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-6.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-7.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-8.jpg',
              'https://i0.hdslb.com/bfs/videoshot/28627454-9.jpg'
            ],
            x: 10,
            y: 10,
            number: 972
          }
        },
        {
          title: 'DASH',
          src: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
          duration: '10:34'
        },
        {
          title: 'FLV',
          src: FLV,
          duration: '00:17'
        }
      ]
    })
  ])
  .create()

// setTimeout(() => {
//   player.changeQuality(Promise.resolve({ src, title: '君の名は' }))
// }, 1000)

//@ts-ignore
if (false) {
  player.applyPlugin(
    vttThumbnails({
      src: 'https://preview.zorores.com/4b/4b1a02c7ffcad4f1ee11cd6f474548cb/thumbnails/sprite.vtt'
    })
  )

  player.applyPlugin(
    ad({
      autoplay: false,
      image:
        'http://5b0988e595225.cdn.sohucs.com/images/20190420/da316f8038b242c4b34f6db18b0418d4.gif',
      // video: VIDEO_LIST[1],
      duration: 10,
      skipDuration: 5,
      target: 'https://oplayer.vercel.app',
      plugins: [hls({ qualityControl: false })]
    })
  )
}

player.context.ui?.menu.register(<MenuBar>{
  name: 'FMT',
  position: 'top',
  children: FORMAT_MENU,
  onChange({ value, name }, elm) {
    src = value
    elm.innerText = name
    player
      .changeSource({ src: value })
      // .changeQuality({ src: value })
      .then((_) => {
        // GET	https://cc.zorores.com/20/2e/202eaab6dff289a5976399077449654e/eng-2.vtt
        // player.context.ui.subtitle.changeSource([
        //   {
        //     name: 'Default',
        //     default: true,
        //     src: 'https://cc.zorores.com/7f/c1/7fc1657015c5ae073e9db2e51ad0f8a0/eng-2.vtt'
        //   }
        // ])
      })
  }
})

console.log(player.context)

player.context.hello.say()

function stopLoad() {
  player.loader?.destroy()
  const u8 = Uint8Array.from(emptyBuffer)
  player.$video.src = URL.createObjectURL(new Blob([u8.buffer]))
}

const meta = () => html`
  <div>
    <h4>Oh-Player v${Player.version}</h4>
    <p>
      STAR ON <a target="_blank" href="https://github.com/shiyiya/oplayer">GitHub</a> |
      <a href="./script.html" target="_blank">SCRIPT DEMO</a>
    </p>
  </div>
`
let logs: HTMLTextAreaElement

const actions = () => html`<p style="display:flex;">
    <input
      type="text"
      @input=${(e: any) => (src = e.target.value)}
      style="width:100%;"
      .value=${live(src)}
    />

    <button @click=${() => player.changeSource({ src })}>Load</button>

    <button
      @click=${() => {
        src =
          VIDEO_LIST[
            currentDataSrcId + 1 >= VIDEO_LIST.length
              ? (currentDataSrcId = 0)
              : (currentDataSrcId += 1)
          ]!

        player.changeSource(
          new Promise((r) => {
            stopLoad()
            r({ src })
          })
        )
      }}
    >
      Queue
    </button>

    <button @click=${stopLoad}>StopLoad</button>
  </p>

  <textarea readonly ${ref((f) => (logs = f as any))}></textarea> `

render(actions(), document.getElementById('actions')!)

player.on((e: PlayerEvent) => {
  if (e.type == 'mousemove') return

  render(actions(), document.getElementById('actions')!)

  let eventName = `==> ${e.type}`
  if ('durationchange' == e.type) {
    eventName += `: ${player.duration}`
  }

  logs.value = eventName + '\r\n' + logs.value
  // logs.style.height = `${logs.scrollHeight}px`

  if (e.type == 'videosourcechange') {
    logs.value = eventName + '\r\n'
  }

  if (logs.value.split('==>').length >= 66) {
    logs.value =
      '==> ------------clear logs------------- \r\n' +
      logs.value.split('==>').slice(0, 20).join('==>')
  }

  // if (e.type != 'progress') console.info(e)
})

// p.$root.addEventListener('click', p.unmute.bind(p), { once: true })

render(meta(), document.getElementById('meta')!)

//@ts-ignore
window.player = player
