import React from 'react'
import Playground from '@agney/playground'
import Layout from '@theme/Layout'
import '@reach/tabs/styles.css'

const code = `
import Player from '/core.es.js'
import ui from '/ui.es.js'
import hls from '/hls.es.js'
import dash from '/dash.es.js'
import danmaku from '/danmaku.es.js'

const player =Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([
    ui({
      menu: [
        {
          name: 'Airplay',
          icon: \`<svg style='scale:0.9' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M662.186667 981.333333H361.813333c-17.194667 0-32.853333-9.386667-40.661333-23.552a50.176 50.176 0 0 1 0-47.104l150.186667-260.565333c7.808-14.08 23.466667-23.509333 40.661333-23.509333 17.194667 0 32.853333 9.386667 40.661333 23.552l150.186667 260.565333c7.850667 14.08 7.850667 32.938667 0 47.061333-7.808 14.122667-23.466667 23.552-40.661333 23.552z m-219.008-94.165333h137.642666L512 767.872l-68.821333 119.296z"></path><path d="M821.76 841.642667h-100.138667c-26.581333 0-46.933333-20.437333-46.933333-47.104 0-26.666667 20.352-47.104 46.933333-47.104h100.138667c37.546667 0 67.285333-29.824 67.285333-67.498667V204.373333c-1.578667-37.674667-31.317333-67.498667-67.285333-67.498666H203.818667c-37.546667 0-67.285333 29.866667-67.285334 67.498666v477.184c0 37.674667 29.738667 67.498667 67.285334 67.498667h100.096c26.624 0 46.933333 20.394667 46.933333 47.104 0 26.666667-20.309333 47.104-46.933333 47.104H203.818667A163.541333 163.541333 0 0 1 42.666667 679.893333V204.373333A161.194667 161.194667 0 0 1 203.818667 42.666667H821.76C909.354667 42.666667 981.333333 114.858667 981.333333 204.373333v477.141334c0 87.893333-71.978667 160.128-159.573333 160.128z"></path></svg>\`,
          onClick: () => {
            if (window.WebKitPlaybackTargetAvailabilityEvent) {
              player.$video.webkitShowPlaybackTargetPicker()
            } else {
              player.plugins.ui.notice('Airplay not available')
            }
          }
        },
        {
          name: 'SOURCE LIST',
          icon: \`<svg style='scale:1.2' viewBox="0 0 1032 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6368" width="200" height="200"><path d="M192.031 452c-33.188 0-60 26.813-60 60s26.813 60 60 60 60-26.813 60-60-26.813-60-60-60zM192.031 212c-33.188 0-60 26.813-60 60s26.813 60 60 60 60-26.813 60-60-26.813-60-60-60zM192.031 698.75c-29.625 0-53.156 24-53.156 53.156s24 53.156 53.156 53.156 53.156-24 53.156-53.156c0-29.156-23.625-53.156-53.156-53.156zM312.031 791.938h559.969v-79.969h-559.969v79.969zM312.031 552.031h559.969v-79.969h-559.969v79.969zM312.031 231.969v79.969h559.969v-79.969h-559.969z" fill="#ffffff" p-id="6369"></path></svg>\`,
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
        progressIndicator: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
        <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z"/>
        <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
        <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z"/>
    </svg>\`,
        loadingIndicator: \`<img src='https://user-images.githubusercontent.com/40481418/135559343-98e82c95-1a67-4083-8ecb-763f6e62577e.gif'/>\`,
      }
    }),
    hls({
      options: {
        hlsQualityControl: true,
        hlsQualitySwitch: 'immediate'
      }
    }),
    dash(),
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
          icon: \`<svg style='scale:0.9' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M895.66 128H128a85.44 85.44 0 0 0-85.44 85.44v127.84H128v-127.84h767.66v597.12H597.28V896H896a85.44 85.44 0 0 0 85.44-85.44V213.44A85.44 85.44 0 0 0 896 128zM42.56 767.16v127.84h127.82a127.82 127.82 0 0 0-127.82-127.84z m0-170.56V682a213.26 213.26 0 0 1 213.28 213.32v0.68h85.44a298.38 298.38 0 0 0-298-298.72h-0.66z m0-170.54v85.44c212-0.2 384 171.5 384.16 383.5v1h85.44c-0.92-258.92-210.68-468.54-469.6-469.28z"></path></svg>\`,
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
  ])
  .create();

  `

export default () => {
  return (
    <Layout title="Oh! Another HTML5 video player" description="Oh! Another HTML5 video player">
      <Playground
        id="oplayer-playground"
        initialSnippet={{
          markup: `<div id=oplayer />`,
          javascript:
            (globalThis?.window && new URL(window.location).searchParams.get('code')) || code
        }}
        defaultEditorTab="javascript"
        transformJs
      />
    </Layout>
  )
}
