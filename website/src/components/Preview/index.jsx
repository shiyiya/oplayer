import React, { useRef, useEffect } from 'react'
import Translate from '@docusaurus/Translate'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import ReactPlayer from '../Player'
import ui from '../../../../packages/ui/dist/index.es'
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
  })
]

const Preview = () => {
  const player = useRef()

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM && player.current) {
      console.log(player.current)
      console.log(require('../../../../packages/danmaku/dist/index.es').default)
      require('../../../../packages/danmaku/dist/index.es')
        .default({
          source: 'https://oplayer.vercel.app/danmaku.xml',
          opacity: 0.8,
          fontSize: 0.75
        })
        .apply(player.current)
    }
  }, [])

  return (
    <div className={styles.Container} id="preview">
      <div className={styles.Title}>
        <Translate id="oplayer.preview">Preview</Translate>
      </div>
      <div>
        <ReactPlayer
          ref={player}
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
