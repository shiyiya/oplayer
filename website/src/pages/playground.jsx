import React from 'react'
import Playground from '@agney/playground'
import Layout from '@theme/Layout'
import '@reach/tabs/styles.css'

const code = `
import Player, { isMobile, isiPad, isiPhone, isIOS } from '/core.es.js'
import ui from '/ui.es.js'
import danmaku from '/danmaku.es.js'
import hls from '/hls.es.js'
import dash from '/dash.es.js'

// https://cdn.jsdelivr.net/gh/shiyiya/oplayer@master/README.md

const player =Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([
    danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml' }),
    ui({
      theme: { primaryColor: '#6668ab' },
      subtitle: {
        source: [
          {
            name: 'Default',
            default: true,
            src: 'https://oplayer.vercel.app/君の名は.srt'
          }
        ]
      },
      thumbnails: { src: 'https://oplayer.vercel.app/thumbnails.jpg', number: 100 },
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
      ]
    })
  ])
  .create();

  console.table(
    JSON.stringify({
      UA: globalThis.navigator?.userAgent,
      isMobile,
      isIOS,
      isiPad,
      isiPhone,
      fullscreenEnabled: Boolean(document.fullscreenEnabled),
      webkitFullscreenEnabled: Boolean(document.webkitFullscreenEnabled),
      mozFullScreenEnabled: Boolean(document.mozFullScreenEnabled),
      msFullscreenEnabled: Boolean(document.msFullscreenEnabled),
      video: Boolean(player.$video.webkitEnterFullscreen),
    })
  )

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
