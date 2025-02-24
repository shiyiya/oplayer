import { html, render } from 'lit'

import { Player } from '@oplayer/core'
import Danmaku from '@oplayer/danmaku'
import dash from '@oplayer/dash'
import hls from '@oplayer/hls'
import mpegts from '@oplayer/mpegts'
import ui from '@oplayer/ui'
import torrent from '@oplayer/torrent'
import { Playlist, Chromecast } from '@oplayer/plugins'

import vercel from '../../packages/docs/public/vercel.svg'

import emptyBuffer from './emptyBuffer'
import { highlight } from './constants'

interface Ctx {
  ui: ReturnType<typeof ui>
  hls: ReturnType<typeof hls>
  dash: ReturnType<typeof dash>
  mpegts: ReturnType<typeof mpegts>
  danmaku: Danmaku
  playlist: Playlist
}

const initialIndex = 0

const POSTER = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png`
const DANMAKU = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/danmaku.xml`
const THUMB = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/thumbnails.jpg`
const SRT = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/君の名は.srt`
const JPSRT = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/君の名は-jp.srt`
const SUPER_DANMAKU = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/天气之子.xml`
const FLV = `https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/weathering-with-you.flv`
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
  // videoAttr: { crossorigin: 'anonymous' }, // screenshot
  lang: 'en',
  languages: {
    en: {
      Play: '👏'
    }
  }
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
      settings: [
        'loop',
        {
          icon: '<svg viewBox="0 0 1024 1024" version="1.1"><path d="M800 170.666667A138.666667 138.666667 0 0 1 938.666667 309.333333v405.546667a138.666667 138.666667 0 0 1-138.666667 138.666667H224A138.666667 138.666667 0 0 1 85.333333 714.88V309.333333a138.666667 138.666667 0 0 1 130.816-138.453333L224 170.666667h576z m0 64H224l-6.144 0.256A74.666667 74.666667 0 0 0 149.333333 309.333333v405.546667c0 41.216 33.450667 74.666667 74.666667 74.666667h576a74.666667 74.666667 0 0 0 74.666667-74.666667V309.333333a74.666667 74.666667 0 0 0-74.666667-74.666666zM234.666667 512c0-134.229333 115.754667-203.733333 218.538666-145.109333A32 32 0 0 1 421.461333 422.4C361.856 388.437333 298.666667 426.410667 298.666667 512c0 85.546667 63.317333 123.562667 122.88 89.728a32 32 0 0 1 31.573333 55.637333C350.549333 715.733333 234.666667 646.101333 234.666667 512z m320 0c0-134.229333 115.754667-203.733333 218.538666-145.109333a32 32 0 0 1-31.744 55.552C681.856 388.437333 618.666667 426.410667 618.666667 512c0 85.546667 63.317333 123.562667 122.88 89.728a32 32 0 0 1 31.573333 55.637333C670.549333 715.733333 554.666667 646.101333 554.666667 512z"></path></svg>',
          name: `Offset`,
          type: 'slider',
          default: 2,
          min: -5,
          max: 5,
          onChange(value) {
            player.context.ui.subtitle.changeOffset(value)
          }
        },
        {
          icon: '<svg viewBox="0 0 1024 1024" version="1.1"><path d="M800 170.666667A138.666667 138.666667 0 0 1 938.666667 309.333333v405.546667a138.666667 138.666667 0 0 1-138.666667 138.666667H224A138.666667 138.666667 0 0 1 85.333333 714.88V309.333333a138.666667 138.666667 0 0 1 130.816-138.453333L224 170.666667h576z m0 64H224l-6.144 0.256A74.666667 74.666667 0 0 0 149.333333 309.333333v405.546667c0 41.216 33.450667 74.666667 74.666667 74.666667h576a74.666667 74.666667 0 0 0 74.666667-74.666667V309.333333a74.666667 74.666667 0 0 0-74.666667-74.666666zM234.666667 512c0-134.229333 115.754667-203.733333 218.538666-145.109333A32 32 0 0 1 421.461333 422.4C361.856 388.437333 298.666667 426.410667 298.666667 512c0 85.546667 63.317333 123.562667 122.88 89.728a32 32 0 0 1 31.573333 55.637333C350.549333 715.733333 234.666667 646.101333 234.666667 512z m320 0c0-134.229333 115.754667-203.733333 218.538666-145.109333a32 32 0 0 1-31.744 55.552C681.856 388.437333 618.666667 426.410667 618.666667 512c0 85.546667 63.317333 123.562667 122.88 89.728a32 32 0 0 1 31.573333 55.637333C670.549333 715.733333 554.666667 646.101333 554.666667 512z"></path></svg>',
          name: `Power By OPlayer`,
          onChange() {
            alert('i love u')
          }
        },
        {
          icon: '<svg viewBox="0 0 1024 1024" version="1.1"><path d="M800 170.666667A138.666667 138.666667 0 0 1 938.666667 309.333333v405.546667a138.666667 138.666667 0 0 1-138.666667 138.666667H224A138.666667 138.666667 0 0 1 85.333333 714.88V309.333333a138.666667 138.666667 0 0 1 130.816-138.453333L224 170.666667h576z m0 64H224l-6.144 0.256A74.666667 74.666667 0 0 0 149.333333 309.333333v405.546667c0 41.216 33.450667 74.666667 74.666667 74.666667h576a74.666667 74.666667 0 0 0 74.666667-74.666667V309.333333a74.666667 74.666667 0 0 0-74.666667-74.666666zM234.666667 512c0-134.229333 115.754667-203.733333 218.538666-145.109333A32 32 0 0 1 421.461333 422.4C361.856 388.437333 298.666667 426.410667 298.666667 512c0 85.546667 63.317333 123.562667 122.88 89.728a32 32 0 0 1 31.573333 55.637333C350.549333 715.733333 234.666667 646.101333 234.666667 512z m320 0c0-134.229333 115.754667-203.733333 218.538666-145.109333a32 32 0 0 1-31.744 55.552C681.856 388.437333 618.666667 426.410667 618.666667 512c0 85.546667 63.317333 123.562667 122.88 89.728a32 32 0 0 1 31.573333 55.637333C670.549333 715.733333 554.666667 646.101333 554.666667 512z"></path></svg>',
          name: `Power By OPlayer`,
          onChange(value) {
            alert('i love u' + value)
          },
          children: [
            {
              name: 'children 1',
              value: '1'
            },
            {
              name: 'children 2',
              value: '2'
            }
          ]
        }
      ],
      pictureInPicture: true,
      // showControls: 'played',
      highlight: { color: 'pink' },
      subtitle: { background: true },
      icons: {
        progressIndicator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
        <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z"/>
        <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
        <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z"/>
    </svg>`,
        next: '👉'
      }
    }),
    torrent({
      library: 'https://cdn.jsdelivr.net/npm/webtorrent@0.98.18/webtorrent.min.js'
    }),
    hls({ forceHLS: true }),
    dash(),
    mpegts(),
    new Danmaku({
      enable: true
      // displaySender: true,
      // source: DANMAKU //SUPER_DANMAKU
    }),
    new Playlist({
      initialIndex: 0,
      sources: [
        {
          title: 'DASH DRM',
          id: 'dash-drm'
        },
        {
          title: 'Hls DRM',
          id: 'hls-drm'
        },
        {
          title: 'hls - muti quality & subtitle & audio',
          src: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8'
          // danmaku: SUPER_DANMAKU
        },
        {
          title: 'dash - muti quality & subtitle & audio',
          src: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd'
        },
        {
          title: 'HLS with SRT subtitle',
          src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          poster: 'https://api.imlazy.ink/img?id19',
          subtitles: [
            {
              name: 'Default',
              src: SRT,
              offset: 2
            }
          ],
          duration: '10:34'
        },
        {
          title: '君の名は - MP4',
          poster: POSTER,
          src: MP4,
          duration: '01:32',
          danmaku: DANMAKU,
          thumbnails: {
            src: THUMB,
            number: 100
          },
          subtitles: [
            {
              name: 'ass',
              type: 'ass',
              src: `https://web.opendrive.com/api/v1/download/file.json/MjBfMzA2MTA2OThf?temp_key=%EF%BF%BD%11%2Bj*%EF%BF%BD%EF%BF%BD%EF%BF%BDC%EF%BF%BDD%EF%BF%BD%EF%BF%BD%EF%BF%BDn%EF%BF%BDm%01%EF%BF%BD%D6%B6%D1%86%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%06%EF%BF%BD%EF%BF%BD%EF%BF%BDm%06%EF%BF%BD%EF%BF%BDv%EF%BF%BD%27%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BDz6%D1%8B%EF%BF%BD%7Bm0%EF%BF%BDm%0C%EF%BF%BDv%EF%BF%BD%EF%BF%BDM%EF%BF%BD%EF%BF%BD%5D%EF%BF%BD%EF%BF%BD%1E%EF%BF%BD%D2%9EC%EF%BF%BD%13.%EF%BF%BD%D8%A9%EF%BF%BD%EF%BF%BD%EF%BF%BDJ%EF%BF%BD%EF%BF%BD%EF%BF%BD%5E%EF%BF%BD%3Bki%EF%BF%BD9%EF%BF%BD%EF%BF%BD%DA%B2&inline=1` //'https://mentoor-st.s3.ir-thr-at1.arvanstorage.ir/media/courses/videos/a220374676eb40e4/001f4770a44497047661e446/subtitle/001f4770a44497047661e446_subtitle.srt', //SRT,
            },
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
      ],
      customFetcher(player, source) {
        if (source.id === 'dash-drm') {
          ;(player.context.dash as ReturnType<typeof dash>).options.drm = {
            'com.widevine.alpha': {
              serverURL: 'https://drm-widevine-licensing.axtest.net/AcquireLicense',
              httpRequestHeaders: {
                'X-AxDRM-Message':
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiYjMzNjRlYjUtNTFmNi00YWUzLThjOTgtMzNjZWQ1ZTMxYzc4IiwibWVzc2FnZSI6eyJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImtleXMiOlt7ImlkIjoiOWViNDA1MGQtZTQ0Yi00ODAyLTkzMmUtMjdkNzUwODNlMjY2IiwiZW5jcnlwdGVkX2tleSI6ImxLM09qSExZVzI0Y3Iya3RSNzRmbnc9PSJ9XX19.4lWwW46k-oWcah8oN18LPj5OLS5ZU-_AQv7fe0JhNjA'
              },
              priority: 0
            }
          }
          return {
            ...source,
            src: 'https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest_1080p.mpd'
          }
        } else if (source.id == 'hls-drm') {
          ;(player.context.hls as ReturnType<typeof hls>).options.config = {
            ...player.context.hls.options.config,
            emeEnabled: true,
            drmSystems: {
              'com.widevine.alpha': {
                licenseUrl: 'https://widevine-proxy.appspot.com/proxy'
              }
            },
            licenseXhrSetup(xhr) {
              xhr.setRequestHeader('content-type', 'application/octet-stream')
              xhr.setRequestHeader('Authorization', 'Bearer token') // or other headers
            }
          }

          return {} //TODO
        } else {
          ;(player.context.dash as ReturnType<typeof dash>).options.drm = null
          ;(player.context.hls as ReturnType<typeof hls>).options.config.emeEnabled = false
        }
        return source
      }
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
