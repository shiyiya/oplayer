import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'
import { ref } from 'lit/directives/ref.js'

import { Player, isMobile, PlayerEvent, Source } from '@oplayer/core'
import danmaku from '@oplayer/danmaku'
import dash from '@oplayer/dash'
import hls from '@oplayer/hls'
import mpegts from '@oplayer/mpegts'
import ui from '@oplayer/ui'
import torrent from '@oplayer/torrent'

import DANMAKU from '../../packages/docs/public/danmaku.xml'
import POSTER from '../../packages/docs/public/poster.png'
import THUMB from '../../packages/docs/public/thumbnails.jpg'
import SRT from '../../packages/docs/public/君の名は.srt'
import JPSRT from '../../packages/docs/public/君の名は-jp.srt'
// import SUPER_DANMAKU from '../../packages/docs/public/天气之子.xml'
import FLV from '../../packages/docs/public/op.flv'
import MP4 from '../../packages/docs/public/君の名は.mp4'
import vercel from '../../packages/docs/public/vercel.svg'

import { MenuBar } from '@oplayer/ui/src/types'
import { FORMAT_MENU, highlight, VIDEO_LIST } from './constants'
import emptyBuffer from './emptyBuffer'
import { vttThumbnails, ad, PlaylistPlugin } from '@oplayer/plugins'

interface Ctx {
  ui: ReturnType<typeof ui>
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
        }
      },
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
      highlight: { color: 'pink' },
      subtitle: {
        background: true
      },
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
    new PlaylistPlugin({
      initialIndex: 0,
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
          title: 'Big Buck Bunny - HLS',
          src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          duration: '10:34'
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
      image: 'http://5b0988e595225.cdn.sohucs.com/images/20190420/da316f8038b242c4b34f6db18b0418d4.gif',
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
    <input type="text" @input=${(e: any) => (src = e.target.value)} style="width:100%;" .value=${live(src)} />

    <button @click=${() => player.changeSource({ src })}>Load</button>

    <button
      @click=${() => {
        src =
          VIDEO_LIST[
            currentDataSrcId + 1 >= VIDEO_LIST.length ? (currentDataSrcId = 0) : (currentDataSrcId += 1)
          ]!

        player.changeSource(
          new Promise<Source>((r) => {
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
      '==> ------------clear logs------------- \r\n' + logs.value.split('==>').slice(0, 20).join('==>')
  }

  // if (e.type != 'progress') console.info(e)
})

// p.$root.addEventListener('click', p.unmute.bind(p), { once: true })

render(meta(), document.getElementById('meta')!)

//@ts-ignore
window.player = player
