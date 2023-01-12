import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'
import { ref } from 'lit/directives/ref.js'

import Player, { PlayerEvent } from '@oplayer/core'
import danmaku from '@oplayer/danmaku'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import ad from '@oplayer/ad'
import mpegts from '@oplayer/mpegts'
import shaka from '@oplayer/shaka'
import { chromecast } from '@oplayer/plugins'

import DANMAKU from '../../website/static/danmaku.xml'
import THUMB from '../../website/static/thumbnails.jpg'
import POSTER from '../../website/static/poster.png'
import SRT from '../../website/static/君の名は.srt'
// import SUPER_DANMAKU from '../../website/static/天气之子.xml'

import { FORMAT_MENU, highlight, VIDEO_LIST } from './constants'
import { MenuBar } from '@oplayer/ui/src/types'

let src = VIDEO_LIST[0]!
let currentDataSrcId = 0

const player = Player.make('#player', {
  // muted: true,
  volume: 0.5,
  // isLive: true,
  // autoplay: true,
  // preload: 'none',
  source: {
    src: '',
    poster: POSTER,
    title: '君の名は'
  },
  videoAttr: { crossorigin: 'anonymous' } // screenshot
  // isNativeUI: () => true
})
  .use([
    ui({
      controlBar: { back: true },
      topSetting: true,
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
      subtitle: {
        source: [
          {
            name: 'Default',
            default: true,
            src: SRT
          }
        ]
      },
      thumbnails: {
        src:
          'https://preview.zorores.com/4b/4b1a02c7ffcad4f1ee11cd6f474548cb/thumbnails/sprite.vtt' ||
          THUMB,
        isVTT: true,
        number: 100
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
    hls(),
    dash(),
    mpegts(),
    shaka({ ui: false }),
    chromecast,
    danmaku({
      enable: false,
      // displaySender: true,
      source: DANMAKU //SUPER_DANMAKU
    })
    // ad({
    //   autoplay: false,
    //   image:
    //     'http://5b0988e595225.cdn.sohucs.com/images/20190420/da316f8038b242c4b34f6db18b0418d4.gif',
    //   // video: VIDEO_LIST[1],
    //   duration: 10,
    //   skipDuration: 5,
    //   target: 'https://oplayer.vercel.app',
    //   plugins: [hls({ qualityControl: false })]
    // })
  ])
  .create()

setTimeout(() => {
  player.changeQuality(Promise.resolve({ src, title: 'sdkadnlaks' }))
}, 1000)

player.plugins.ui?.highlight?.(highlight)

player.plugins.ui?.menu.register(<MenuBar>{
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
        // player.plugins.ui.subtitle.updateSource([
        //   {
        //     name: 'Default',
        //     default: true,
        //     src: 'https://cc.zorores.com/7f/c1/7fc1657015c5ae073e9db2e51ad0f8a0/eng-2.vtt'
        //   }
        // ])
      })
  }
})

console.log(player.plugins)

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
