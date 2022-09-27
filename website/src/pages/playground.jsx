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
      ]
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
