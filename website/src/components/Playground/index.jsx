import React, { useEffect } from 'react'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import Translate from '@docusaurus/Translate'
import danmaku from '../../../../packages/danmaku/dist/index.es'
import ui from '../../../../packages/ui/dist/index.es'
import ReactPlayer from '../../components/Player'
import styles from './styles.module.css'

const plugins = [
  danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml' }),
  ui({
    theme: { primaryColor: '#6668ab' },
    subtitle: [
      {
        name: '君の名は',
        default: true,
        url: 'https://oplayer.vercel.app/君の名は.srt'
      }
    ],
    thumbnails: { url: 'https://oplayer.vercel.app/thumbnails.jpg', number: 100 }
  })
]

const Playground = () => {
  // useEffect(() => {
  //   if (ExecutionEnvironment.canUseDOM) {
  //     const Player = require('@oplayer/core').default
  //     const ui = require('@oplayer/ui').default
  //     const danmaku = require('@oplayer/danmaku').default
  //     setTimeout(() => {
  //       Player.make(document.querySelector('#oplayer'), {
  //         source: { src: 'https://oplayer.vercel.app/君の名は.mp4' }
  //       })
  //         .use([
  //           danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml' }),
  //           ui({
  //             theme: { primaryColor: '#9370db' },
  //             subtitle: [
  //               {
  //                 name: '君の名は',
  //                 default: true,
  //                 url: 'https://oplayer.vercel.app/君の名は.srt'
  //               }
  //             ]
  //           })
  //         ])
  //         .create()
  //     })
  //   }
  // }, [])

  return (
    <div className={styles.Container} id="preview">
      <div className={styles.Title}>
        <Translate id="oplayer.preview">Preview</Translate>
      </div>
      <div>
        <ReactPlayer
          plugins={plugins}
          source={{ src: 'https://oplayer.vercel.app/君の名は.mp4' }}
          onEvent={console.log}
        />
      </div>
    </div>
  )
}

export default Playground
