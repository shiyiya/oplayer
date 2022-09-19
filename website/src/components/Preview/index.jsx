import React from 'react'
import Translate from '@docusaurus/Translate'
import danmaku from '../../../../packages/danmaku/dist/index.es'
import ui from '../../../../packages/ui/dist/index.es'
import ReactPlayer, { isMobile } from '../Player'
import styles from './styles.module.css'

const plugins = [
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
  }),
  danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml', fontSize: isMobile ? 0.6 : 0.8 })
]

const Preview = () => {
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
          source={{
            src: 'https://oplayer.vercel.app/君の名は.mp4',
            poster: 'https://oplayer.vercel.app/poster.png'
          }}
          onEvent={console.log}
        />
      </div>
    </div>
  )
}

export default Preview
