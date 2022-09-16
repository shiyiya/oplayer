import React from 'react'
import Playground from '@agney/playground'
import '@reach/tabs/styles.css'

const code = `
import Player from '/core.es.js'
import ui from '/ui.es.js'
import danmaku from '/danmaku.es.js'
import hls from '/hls.es.js'
import dash from '/dash.es.js'

// https://cdn.jsdelivr.net/gh/shiyiya/oplayer@master/README.md

Player.make(document.getElementById('app'), {
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
  .create()`

export default () => {
  const snippet = {
    markup: `<div id=app />`,
    javascript: code
  }
  return (
    <Playground id="example" initialSnippet={snippet} defaultEditorTab="javascript" transformJs />
  )
}
