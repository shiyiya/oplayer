//@ts-nocheck
import Player, { PlayerEvent, isMobile, isIOS, isiPad, isiPhone } from '@oplayer/core'
import danmaku, { DanmakuItem } from '@oplayer/danmaku'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import ad from '@oplayer/ad'
import mpegts from '@oplayer/mpegts'

import MP4 from '../../website/static/君の名は.mp4'
import SRT from '../../website/static/君の名は.srt'
import DANMAKU from '../../website/static/danmaku.xml'
import THUMB from '../../website/static/thumbnails.jpg'
import POSTER from '../../website/static/poster.png'
import op from '../../website/static/op.flv'

import { html, render } from 'lit'
import { live } from 'lit/directives/live.js'
import { ref } from 'lit/directives/ref.js'
import { played } from '@oplayer/ui/src/components/Progress.style'
import { $ } from '@oplayer/core'

const dataSrcs = [
  MP4,
  op,
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://yun.ssdm.cc/SBDM/ShinigamiBocchantoKuroMaid02.m3u8',
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8',
  'https://video.zidivo.com/live983/GrtjM_FNGC/playlist.m3u8', //live
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

const player = Player.make('#player', {
  muted: true,
  volume: 0.5,
  // isLive: true,
  source: { poster: POSTER, src },
  videoAttr: { crossorigin: 'anonymous' } // screenshot
})
  .use([
    ui({
      // speed: [],
      autoFocus: true,
      screenshot: true,
      settings: ['loop'],
      theme: { primaryColor: '#00b2ff' },
      subtitle: {
        shadow:
          '0px -6px 0 #212121, 0px -6px 0 #212121, 0px 6px 0 #212121, 0px 6px 0 #212121, -6px 0px 0 #212121, 6px 0px 0 #212121, -6px 0px 0 #212121, 6px 0px 0 #212121, -6px -6px 0 #212121, 6px -6px 0 #212121, -6px 6px 0 #212121, 6px 6px 0 #212121, -6px 18px 0 #212121, 0px 18px 0 #212121, 6px 18px 0 #212121, 0 19px 1px rgb(0 0 0 / 10%), 0 0 6px rgb(0 0 0 / 10%), 0 6px 3px rgb(0 0 0 / 30%), 0 12px 6px rgb(0 0 0 / 20%), 0 18px 18px rgb(0 0 0 / 25%), 0 24px 24px rgb(0 0 0 / 20%), 0 36px 36px rgb(0 0 0 / 15%)',
        fontSize: !isMobile ? '40pt' : '16pt',
        fontFamily: 'Luckiest Guy',
        source: [
          {
            name: 'Default',
            default: true,
            src: 'https://cc.zorores.com/7f/c1/7fc1657015c5ae073e9db2e51ad0f8a0/eng-2.vtt'
          }
        ]
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
          name: 'Airplay',
          icon: `<svg style='scale:0.9' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M662.186667 981.333333H361.813333c-17.194667 0-32.853333-9.386667-40.661333-23.552a50.176 50.176 0 0 1 0-47.104l150.186667-260.565333c7.808-14.08 23.466667-23.509333 40.661333-23.509333 17.194667 0 32.853333 9.386667 40.661333 23.552l150.186667 260.565333c7.850667 14.08 7.850667 32.938667 0 47.061333-7.808 14.122667-23.466667 23.552-40.661333 23.552z m-219.008-94.165333h137.642666L512 767.872l-68.821333 119.296z"></path><path d="M821.76 841.642667h-100.138667c-26.581333 0-46.933333-20.437333-46.933333-47.104 0-26.666667 20.352-47.104 46.933333-47.104h100.138667c37.546667 0 67.285333-29.824 67.285333-67.498667V204.373333c-1.578667-37.674667-31.317333-67.498667-67.285333-67.498666H203.818667c-37.546667 0-67.285333 29.866667-67.285334 67.498666v477.184c0 37.674667 29.738667 67.498667 67.285334 67.498667h100.096c26.624 0 46.933333 20.394667 46.933333 47.104 0 26.666667-20.309333 47.104-46.933333 47.104H203.818667A163.541333 163.541333 0 0 1 42.666667 679.893333V204.373333A161.194667 161.194667 0 0 1 203.818667 42.666667H821.76C909.354667 42.666667 981.333333 114.858667 981.333333 204.373333v477.141334c0 87.893333-71.978667 160.128-159.573333 160.128z"></path></svg>`,
          onClick: () => {
            if (window.WebKitPlaybackTargetAvailabilityEvent) {
              player.$video.webkitShowPlaybackTargetPicker()
            } else {
              player.plugins.ui.notice('Airplay not available')
            }
          }
        },
        {
          name: '视频列表',
          icon: `<svg style='scale:1.2' viewBox="0 0 1032 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6368" width="200" height="200"><path d="M192.031 452c-33.188 0-60 26.813-60 60s26.813 60 60 60 60-26.813 60-60-26.813-60-60-60zM192.031 212c-33.188 0-60 26.813-60 60s26.813 60 60 60 60-26.813 60-60-26.813-60-60-60zM192.031 698.75c-29.625 0-53.156 24-53.156 53.156s24 53.156 53.156 53.156 53.156-24 53.156-53.156c0-29.156-23.625-53.156-53.156-53.156zM312.031 791.938h559.969v-79.969h-559.969v79.969zM312.031 552.031h559.969v-79.969h-559.969v79.969zM312.031 231.969v79.969h559.969v-79.969h-559.969z" fill="#ffffff" p-id="6369"></path></svg>`,
          children: [
            {
              name: 'mp4',
              default: true,
              value: MP4
            },
            {
              name: 'hls',
              value: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
              name: 'dash',
              value: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd'
            },
            {
              name: 'flv',
              value: op
            }
          ],
          onChange({ value }) {
            src = value
            player.changeSource({ src: value })
          }
        }
      ],
      icons: {
        progressIndicator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
        <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z"/>
        <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
        <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z"/>
    </svg>`,
        loadingIndicator: `<img src='https://user-images.githubusercontent.com/40481418/135559343-98e82c95-1a67-4083-8ecb-763f6e62577e.gif'/>`
      }
    }),
    mpegts(),
    dash(),
    hls({
      options: {
        hlsQualityControl: true,
        hlsQualitySwitch: 'immediate'
      }
    }),
    {
      name: 'custom',
      apply: () => ({
        say: () => {
          console.log('custom plugin')
        }
      })
    },
    {
      name: 'oplayer-plugin-chromecast',
      apply(player) {
        let cast, session, currentMedia

        function loadChromecast() {
          return new Promise((resolve, reject) => {
            $.render(
              $.create('script', {
                type: 'text/javascript',
                src: 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
              }),
              document.body
            )

            window.__onGCastApiAvailable = (isAvailable) => {
              if (isAvailable) {
                cast = window.chrome.cast
                const sessionRequest = new cast.SessionRequest(
                  cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
                )
                const apiConfig = new cast.ApiConfig(
                  sessionRequest,
                  () => {},
                  (status) => {
                    if (status === cast.ReceiverAvailability.AVAILABLE) {
                    } else {
                    }
                  }
                )
                cast.initialize(apiConfig, resolve, reject)
              } else {
                player.plugins.ui.notice('Chromecast not available')
                player.plugins.ui.menu.unregister('chromecast')
                reject()
              }
            }
          })
        }

        const discoverDevices = () => {
          cast.requestSession(
            (session) => {
              session = session
              const mediaInfo = new cast.media.MediaInfo(player.options.video.url)
              const request = new cast.media.LoadRequest(mediaInfo)

              if (!session) window.open(media)

              session
                .loadMedia(
                  request,
                  (media) => {
                    currentMedia = media
                  },
                  (err) => {
                    player.plugins.ui.notice('Chromecast: ' + err.message)
                  }
                )
                .play()
            },
            (err) => {
              if (err.code === 'cancel') {
                session = undefined
              } else {
                player.plugins.ui.notice('Chromecast: ' + err.code + (err.description || ''))
              }
            }
          )
        }

        player.plugins.ui.menu.register({
          name: 'Chromecast',
          icon: `<svg style='scale:0.9' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2081" width="200" height="200"><path d="M895.66 128H128a85.44 85.44 0 0 0-85.44 85.44v127.84H128v-127.84h767.66v597.12H597.28V896H896a85.44 85.44 0 0 0 85.44-85.44V213.44A85.44 85.44 0 0 0 896 128zM42.56 767.16v127.84h127.82a127.82 127.82 0 0 0-127.82-127.84z m0-170.56V682a213.26 213.26 0 0 1 213.28 213.32v0.68h85.44a298.38 298.38 0 0 0-298-298.72h-0.66z m0-170.54v85.44c212-0.2 384 171.5 384.16 383.5v1h85.44c-0.92-258.92-210.68-468.54-469.6-469.28z"></path></svg>`,
          onClick() {
            let promis = Promise.resolve()
            if (!cast) {
              promis = loadChromecast()
            }

            promis.then((_) => {
              if (session) {
                currentMedia?.stop()
                session?.stop()
              } else {
                discoverDevices()
              }
            })
          }
        })
      }
    },
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
    danmaku({
      enable: false,
      source: DANMAKU,
      opacity: 0.8,
      filter: (d: DanmakuItem) => d.text == '+1s'
    })
  ])
  .create()

console.log(player.plugins)

player.plugins.custom.say()

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

// console.table({
//   UA: globalThis.navigator?.userAgent,
//   isMobile,
//   isIOS,
//   isiPad,
//   isiPhone,
//   fullscreenEnabled: Boolean(document.fullscreenEnabled),
//   webkitFullscreenEnabled: Boolean(document.webkitFullscreenEnabled),
//   mozFullScreenEnabled: Boolean(document.mozFullScreenEnabled),
//   msFullscreenEnabled: Boolean(document.msFullscreenEnabled),
//   video: Boolean(player.$video.webkitEnterFullscreen)
// })
