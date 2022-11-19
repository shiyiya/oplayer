//@ts-nocheck
import Player, { PlayerEvent, isMobile, isIOS, isiPad, isiPhone } from '@oplayer/core'
import danmaku, { DanmakuItem } from '@oplayer/danmaku'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import ad from '@oplayer/ad'

import MP4 from '../../website/static/君の名は.mp4'
import SRT from '../../website/static/君の名は.srt'
import DANMAKU from '../../website/static/danmaku.xml'
import THUMB from '../../website/static/thumbnails.jpg'
import POSTER from '../../website/static/poster.png'

import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'
import { ref } from 'lit/directives/ref.js'
import { played } from '@oplayer/ui/src/components/Progress.style'

const dataSrcs = [
  'https://yun.ssdm.cc/SBDM/ShinigamiBocchantoKuroMaid02.m3u8',
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://video.zidivo.com/live983/GrtjM_FNGC/playlist.m3u8', //live
  MP4,
  'https://cdn6.hnzycdn.com:65/20220712/O5XeHGZz/1935kb/hls/index.m3u8',
  'https://cdn6.hnzycdn.com:65/20220712/xb2EScnz/1672kb/hls/index.m3u8',
  'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
  'https://ukzyvod3.ukubf5.com/20220410/yAU8vUFg/2000kb/hls/index.m3u8',
  'https://media.w3.org/2010/05/sintel/trailer.mp4'
] as const

const querySrc = new URLSearchParams(window.location.search).get('src')
let src = querySrc || dataSrcs[0]
let currentDataSrcId = querySrc ? -1 : 0

const quailitySrcs = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
] as const

let logs: HTMLTextAreaElement

const player = Player.make(document.getElementById('player')!, {
  muted: true,
  volume: 0.5,
  // isLive: true,
  source: { poster: POSTER },
  videoAttr: { crossorigin: 'anonymous' } // screenshot
})
  .use([
    ui({
      autoFocus: true,
      screenshot: true,
      theme: { primaryColor: '#00b2ff' },
      subtitle: {
        color: 'hotpink',
        fontSize: isMobile ? 16 : 20,
        source: []
      },
      thumbnails: {
        src:
          'https://preview.zorores.com/4b/4b1a02c7ffcad4f1ee11cd6f474548cb/thumbnails/sprite.vtt' ||
          THUMB,
        base: 'https://preview.zorores.com/4b/4b1a02c7ffcad4f1ee11cd6f474548cb/thumbnails/',
        isVTT: true,
        number: 100
      },
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
      ],
      menu: [
        {
          name: '视频列表',
          children: [
            {
              name: 'mp4',
              default: true,
              value: 'https://oplayer.vercel.app/君の名は.mp4'
            },
            {
              name: 'hls',
              value: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
              name: 'dash',
              value: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd'
            }
          ],
          onChange({ value }) {
            player.changeSource({ src: value })
          }
        }
      ],
      icons: {
        progressIndicator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
        <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z" fill="#333"/>
        <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
        <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z" fill="#333"/>
    </svg>`,
        loadingIndicator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width='9em' height='9em' style="opacity: 0.9">
      <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z" fill="#333"/>
      <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
      <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z" fill="#333"/>
    </svg>`
      }
    }),
    dash(),
    hls({
      options: {
        hlsQualityControl: true,
        hlsQualitySwitch: 'immediate'
      }
    })
    // ad({
    //   autoplay: false,
    //   image:
    //     'http://5b0988e595225.cdn.sohucs.com/images/20190420/da316f8038b242c4b34f6db18b0418d4.gif',
    //   // video: dataSrcs[1],
    //   duration: 10,
    //   skipDuration: 5,
    //   target: 'https://oplayer.vercel.app',
    //   plugins: [
    //     hls({
    //       options: {
    //         hlsQualityControl: true,
    //         hlsQualitySwitch: 'immediate'
    //       }
    //     })
    //   ]
    // })
    // danmaku({
    //   source: DANMAKU,
    //   opacity: 0.8,
    //   filter: (d: DanmakuItem) => d.text == '+1s'
    // })
  ])
  .create()

setTimeout(() => {
  player.changeQuality({ src })
}, 3)

player.emit('subtitlechange', [
  {
    name: 'Default',
    default: true,
    src: 'https://cc.zorores.com/7f/c1/7fc1657015c5ae073e9db2e51ad0f8a0/eng-2.vtt'
  }
])

const meta = () => html`
  <div>
    <h4>Oh-Player v${Player.version}</h4>
    <p>
      STAR ON <a target="_blank" href="https://github.com/shiyiya/oplayer">GitHub</a> |
      <a href="./script.html" target="_blank">SCRIPT DEMO</a>
    </p>
  </div>
`

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
          dataSrcs[
            currentDataSrcId + 1 >= dataSrcs.length
              ? (currentDataSrcId = 0)
              : (currentDataSrcId += 1)
          ]!
        player.changeSource({ src })
      }}
    >
      Queue
    </button>
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
    logs.value = ''
  }

  if (logs.value.split('==>').length >= 66) {
    logs.value =
      '==> ------------clear logs------------- \r\n' +
      logs.value.split('==>').slice(0, 20).join('==>')
  }

  // console.info(e)
})

// p.$root.addEventListener('click', p.unmute.bind(p), { once: true })

render(meta(), document.getElementById('meta')!)

window.p = player

console.table({
  UA: globalThis.navigator?.userAgent,
  isMobile,
  isIOS,
  isiPad,
  isiPhone,
  fullscreenEnabled: Boolean(document.fullscreenEnabled),
  webkitFullscreenEnabled: Boolean(document.webkitFullscreenEnabled),
  mozFullScreenEnabled: Boolean(document.mozFullScreenEnabled),
  msFullscreenEnabled: Boolean(document.msFullscreenEnabled),
  video: Boolean(player.$video.webkitEnterFullscreen)
})
