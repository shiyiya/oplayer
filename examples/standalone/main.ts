import Player, { PlayerEvent } from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'

import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'
import { ref } from 'lit/directives/ref.js'

//@ts-ignore
import poster from './poster.png'

const dataSrcs = [
  'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4',
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://ukzyvod3.ukubf5.com/20220410/yAU8vUFg/2000kb/hls/index.m3u8',
  'magnet:?xt=urn:btih:16E51415639B7A1F50AB99B4A0E7CE1DABD86712'
] as const

const querySrc = new URLSearchParams(window.location.search).get('src')
let src = querySrc || dataSrcs[0]
let currentDataSrcId = querySrc ? -1 : 0

const quailitySrcs = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
] as const

let logs: HTMLTextAreaElement

const p = Player.make(document.getElementById('player')!, {
  volume: 0.1,
  source: {
    src,
    poster: poster // 'https://media.w3.org/2010/05/sintel/poster.png'
  },
  videoAttr: {
    crossorigin: 'anonymous'
  }
})
  .use([
    ui({
      speed: ['0.5', '1.0', '2.0', '10.0'].reverse(),
      subtitle: [
        {
          name: 'Default',
          default: true,
          url: 'https://s-sh-17-dplayercdn.oss.dogecdn.com/hikarunara.vtt'
        },
        {
          name: 'Japenese',
          url: 'https://s-sh-17-dplayercdn.oss.dogecdn.com/hikarunara.vtt'
        }
      ]
    }),
    hls()
  ])
  .create()

const meta = () => html`
  <div>
    <h4>Oh-Player v${Player.version}</h4>
    <p>
      STAR ON <a target="_blank" href="https://github.com/shiyiya/oplayer">GitHub</a> |
      <a href="./umd.html" target="_blank">UMD DEMO HERE</a>
    </p>
    <p>Plugin used: ${p.plugins.join('  ')}</p>
  </div>
`

const actions = () => html`<p style="display:flex;">
    <input
      type="text"
      @input=${(e: any) => (src = e.target.value)}
      style="width:100%;"
      .value=${live(src)}
    />

    <button @click=${() => p.changeSource({ src })}>Load</button>

    <button
      @click=${() => {
        src =
          dataSrcs[
            currentDataSrcId + 1 >= dataSrcs.length
              ? (currentDataSrcId = 0)
              : (currentDataSrcId += 1)
          ]!
        p.changeSource({ src })
      }}
    >
      Queue
    </button>
  </p>

  <textarea readonly ${ref((f) => (logs = f as any))}></textarea> `

render(actions(), document.getElementById('actions')!)

p.on((e: PlayerEvent) => {
  if (e.type == 'mousemove') return

  render(actions(), document.getElementById('actions')!)

  let eventName = `==> ${e.type}`
  if ('durationchange' == e.type) {
    eventName += `: ${p.duration}`
  }

  logs.value = eventName + '\r\n' + logs.value
  logs.style.height = `${logs.scrollHeight}px`

  if (e.type == 'videosourcechange' || logs.value.split('==>').length >= 110) {
    logs.value = ''
    logs.style.height = '200px'
  }

  console.info(e)
})

render(meta(), document.getElementById('meta')!)
