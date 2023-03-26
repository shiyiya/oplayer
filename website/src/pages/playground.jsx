import React from 'react'
import Layout from '@theme/Layout'
import Playground from '@agney/playground'
import '@reach/tabs/styles.css'

const code = `
import Player, { $ } from '/core.es.js'
import ui from '/ui.es.js'
import hls from '/hls.es.js'
import dash from '/dash.es.js'
import mpegts from '/mpegts.es.js'
import danmaku from '/danmaku.es.js'
import { chromecast } from '/plugins.es.js'

// html script example:
// preview: https://ohplayer.netlify.app/script.html
// code: https://github.com/shiyiya/oplayer/blob/main/examples/script.html

const player = Player.make('#oplayer', {
  source: {
    src: '/君の名は.mp4',
    poster: '/poster.png'
  }
})
  .use([
    ui({
      theme:{ primaryColor: 'rgb(231 170 227)' },
      icons: {
        progressIndicator: window.progressIndicator,
        loadingIndicator: window.loadingIndicator,
        setting: window.setting,
        fullscreen: window.fullscreen,
        volume: window.volume,
        chromecast: window.chromecast
      }
    }),
    hls(),
    dash(),
    mpegts(),
    chromecast,
    // 海量弹幕 /天气之子.xml
    danmaku({ enable: false, source: '/danmaku.xml' })
  ])
  .create()

player.plugins.ui.menu.register({
  name: 'FORMAT',
  children: [
    {
      name: 'MP4',
      default: true,
      value: '/君の名は.mp4'
    },
    {
      name: 'HLS',
      value: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    },
    {
      name: 'DASH',
      value: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd'
    },
    {
      name: 'FLV',
      value: '/op.flv'
    }
  ],
  onChange({ name, value }, elm) {
    elm.innerText = name
    player.changeSource({ src: value })
  }
})
  `

export default () => {
  return (
    <Layout title="Oh! Another HTML5 video player" description="Oh! Another HTML5 video player">
      <Playground
        initialSnippet={{
          markup: `
          <style>
          #oplayer{aspect-ratio: 16/9;}
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          .h-12{ height: 3rem; }
          @keyframes spin {
            to {
                transform: rotate(1turn)
            }
        }
        </style>
          <div id="oplayer" />
          <script>
            window.progressIndicator = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                  <path d="M16.118 3.667h.382a3.667 3.667 0 013.667 3.667v7.333a3.667 3.667 0 01-3.667 3.667h-11a3.667 3.667 0 01-3.667-3.667V7.333A3.667 3.667 0 015.5 3.666h.382L4.95 2.053a1.1 1.1 0 011.906-1.1l1.567 2.714h5.156L15.146.953a1.101 1.101 0 011.906 1.1l-.934 1.614z"/>
                  <path d="M5.561 5.194h10.878a2.2 2.2 0 012.2 2.2v7.211a2.2 2.2 0 01-2.2 2.2H5.561a2.2 2.2 0 01-2.2-2.2V7.394a2.2 2.2 0 012.2-2.2z" fill="#fff"/>
                  <path d="M6.967 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1zM15.033 8.556a1.1 1.1 0 011.1 1.1v2.689a1.1 1.1 0 11-2.2 0V9.656a1.1 1.1 0 011.1-1.1z"/>
              </svg>\`
              window.loadingIndicator =  \`<svg class="animate-spin h-12" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_119_318)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M99.9942 183.711C106.781 191.856 113.567 200 127.14 200C158.384 200 167.409 158.444 167.421 127.156C167.421 113.584 175.565 106.798 183.71 100.012C191.855 93.2255 200 86.4395 200 72.8675C200 41.6139 158.384 32.5774 127.151 32.5774C113.579 32.5774 106.792 24.4331 100.006 16.2887C93.2194 8.14435 86.433 0 72.8602 0C41.6048 0 32.5678 41.6139 32.5678 72.8445C32.5678 86.4165 24.4259 93.2025 16.2839 99.9885C8.14196 106.775 0 113.561 0 127.133C0 158.386 41.6048 167.423 72.8487 167.423C86.4215 167.423 93.2079 175.567 99.9942 183.711ZM100 137C120.435 137 137 120.435 137 100C137 79.5655 120.435 63 100 63C79.5655 63 63 79.5655 63 100C63 120.435 79.5655 137 100 137Z" fill="url(#paint0_linear_119_318)"/> </g> <defs> <linearGradient id="paint0_linear_119_318" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse"> <stop stop-color="#DF99F7"/> <stop offset="1" stop-color="#FFDBB0"/> </linearGradient> <clipPath id="clip0_119_318"> <rect width="200" height="200" fill="white"/> </clipPath> </defs> </svg>\`
              window.setting = \`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M128.603 16.3347C115.825 -5.44489 84.3365 -5.4449 71.5579 16.3347L71.0938 17.1257C65.1986 27.1733 54.4518 33.378 42.8027 33.4596L41.8856 33.466C16.6346 33.6428 0.890585 60.9123 13.3629 82.8687L13.8159 83.6661C19.5698 93.7953 19.5698 106.205 13.8159 116.334L13.3629 117.131C0.890586 139.088 16.6346 166.357 41.8856 166.534L42.8027 166.54C54.4517 166.622 65.1986 172.827 71.0938 182.874L71.5579 183.665C84.3365 205.445 115.825 205.445 128.603 183.665L129.067 182.874C134.963 172.827 145.709 166.622 157.358 166.54L158.276 166.534C183.527 166.357 199.271 139.088 186.798 117.131L186.345 116.334C180.591 106.205 180.591 93.7953 186.345 83.6661L186.798 82.8687C199.271 60.9123 183.527 33.6428 158.276 33.466L157.358 33.4596C145.709 33.378 134.963 27.1733 129.067 17.1257L128.603 16.3347ZM100.081 149.604C127.476 149.604 149.685 127.396 149.685 100C149.685 72.6042 127.476 50.3955 100.081 50.3955C72.6848 50.3955 50.4761 72.6042 50.4761 100C50.4761 127.396 72.6848 149.604 100.081 149.604Z" fill="url(#paint0_linear_104_76)"/> <defs> <linearGradient id="paint0_linear_104_76" x1="100.081" y1="0" x2="100.081" y2="200" gradientUnits="userSpaceOnUse"> <stop stop-color="#DF99F7"/> <stop offset="1" stop-color="#FFDBB0"/> </linearGradient> </defs> </svg>\`
              window.fullscreen = [
                \`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_105_323)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M106.973 87.6003C103.915 93.0385 96.0852 93.0385 93.027 87.6003L50.4686 11.9213C47.4696 6.58851 51.3234 7.97602e-06 57.4416 5.67316e-06L142.558 0C148.677 -5.34872e-07 152.53 6.58849 149.531 11.9213L106.973 87.6003ZM87.6003 106.973C93.0385 103.915 93.0385 96.0851 87.6003 93.0269L11.9213 50.4685C6.58848 47.4696 -1.12708e-05 51.3233 -1.15382e-05 57.4415L-1.52588e-05 142.558C-1.55262e-05 148.677 6.58849 152.53 11.9213 149.531L87.6003 106.973ZM106.973 112.4C103.915 106.961 96.0852 106.962 93.027 112.4L50.4686 188.079C47.4697 193.412 51.3234 200 57.4416 200H142.558C148.677 200 152.53 193.411 149.531 188.079L106.973 112.4ZM112.4 93.027C106.961 96.0853 106.961 103.915 112.4 106.973L188.079 149.531C193.412 152.53 200 148.677 200 142.558V57.4417C200 51.3235 193.411 47.4697 188.079 50.4687L112.4 93.027Z" fill="url(#paint0_linear_105_323)"/> </g> <defs> <linearGradient id="paint0_linear_105_323" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse"> <stop stop-color="#DF99F7"/> <stop offset="1" stop-color="#FFDBB0"/> </linearGradient> <clipPath id="clip0_105_323"> <rect width="200" height="200" fill="white"/> </clipPath> </defs> </svg>\`,
              \`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_118_208)"> <path d="M100 200C97.1048 105.262 94.738 102.91 0 100C94.738 97.1048 97.0903 94.738 100 0C102.895 94.738 105.262 97.0903 200 100C105.262 102.91 102.91 105.233 100 200Z" fill="url(#paint0_linear_118_208)"/> </g> <defs> <linearGradient id="paint0_linear_118_208" x1="14" y1="26" x2="179" y2="179.5" gradientUnits="userSpaceOnUse"> <stop stop-color="#E9B8FF"/> <stop offset="1" stop-color="#F9ECFF"/> </linearGradient> <clipPath id="clip0_118_208"> <rect width="200" height="200" fill="white"/> </clipPath> </defs> </svg>\`
              ]
              window.volume = [
                \`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_238_1269)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M75.5492 178.786L75.5488 178.787L62.9138 166.152C62.9709 166.927 63 167.71 63 168.5C63 185.897 48.897 200 31.5 200C14.103 200 0 185.897 0 168.5C0 151.103 14.103 137 31.5 137C32.2899 137 33.073 137.029 33.8483 137.086L20.8627 124.101L20.8654 124.098C7.95846 110.931 0 92.8947 0 73C0 32.6832 32.6832 0 73 0C92.8947 0 110.931 7.95845 124.098 20.8654L124.1 20.863L124.491 21.2532C124.576 21.3384 124.662 21.4239 124.747 21.5095L137.086 33.849C137.029 33.0735 137 32.2901 137 31.5C137 14.103 151.103 0 168.5 0C185.897 0 200 14.103 200 31.5C200 48.897 185.897 63 168.5 63C167.71 63 166.927 62.9709 166.151 62.9137L178.492 75.2547C178.577 75.3389 178.661 75.4234 178.745 75.508L178.786 75.5491L178.786 75.5492C191.898 88.7461 200 106.927 200 127C200 167.317 167.317 200 127 200C106.927 200 88.7461 191.898 75.5492 178.786Z" fill="url(#paint0_linear_238_1269)"/> </g> <defs> <linearGradient id="paint0_linear_238_1269" x1="14" y1="26" x2="179" y2="179.5" gradientUnits="userSpaceOnUse"> <stop stop-color="#E9B8FF"/> <stop offset="1" stop-color="#F9ECFF"/> </linearGradient> <clipPath id="clip0_238_1269"> <rect width="200" height="200" fill="white"/> </clipPath> </defs> </svg>\`,
                \`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_238_1284)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M50 0H0V100C0 155.228 44.7715 200 100 200C155.228 200 200 155.228 200 100V0H150C122.386 0 100 22.3858 100 50C100 22.3858 77.6142 0 50 0Z" fill="url(#paint0_linear_238_1284)"/> </g> <defs> <linearGradient id="paint0_linear_238_1284" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse"> <stop stop-color="#A7B5FF"/> <stop offset="1" stop-color="#F3ACFF"/> </linearGradient> <clipPath id="clip0_238_1284"> <rect width="200" height="200" fill="white"/> </clipPath> </defs> </svg>\`
              ]
              window.chromecast = \`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_231_793)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M50 0H200V50V150L150 200L150 50H0L50 0ZM0 165.067V100L65.067 100L0 165.067ZM100 200H35.7777L100 135.778L100 200Z" fill="url(#paint0_linear_231_793)"/> </g> <defs> <linearGradient id="paint0_linear_231_793" x1="177" y1="-9.23648e-06" x2="39.5" y2="152.5" gradientUnits="userSpaceOnUse"> <stop stop-color="#B0B9FF"/> <stop offset="1" stop-color="#E7E9FF"/> </linearGradient> <clipPath id="clip0_231_793"> <rect width="200" height="200" fill="white"/> </clipPath> </defs> </svg>\`
          </script>
          `,
          javascript: globalThis?.location?.search || code
        }}
        defaultEditorTab="javascript"
        transformJs
        mode="light"
      />
    </Layout>
  )
}
