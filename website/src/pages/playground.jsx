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
          name: 'SOURCE',
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
