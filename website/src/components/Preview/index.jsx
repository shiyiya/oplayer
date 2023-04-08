import React, { useRef } from 'react'
import Translate from '@docusaurus/Translate'
import ReactPlayer from '../Player'
import ui from '../../../../packages/ui/dist/index.es'
import hls from '../../../../packages/hls/dist/index.es'
import dash from '../../../../packages/dash/dist/index.es'
import mpegts from '../../../../packages/mpegts/dist/index.es'
import danmaku from '../../../../packages/danmaku/dist/index.es'
import { PlaylistPlugin } from '../../../../packages/plugins/dist/index.es'

import styles from './styles.module.css'

const plugins = [
  ui({
    showControls: 'played',
    pictureInPicture: true
  }),
  danmaku({ source: '/danmaku.xml', fontSize: 0.75 }),
  hls(),
  dash(),
  mpegts(),
  new PlaylistPlugin({
    initialIndex: 0,
    autoNext: true,
    sources: [
      {
        title: '君の名は - MP4',
        src: '/君の名は.mp4',
        poster: '/poster.png',
        duration: '01:32',
        thumbnails: {
          src: '/thumbnails.jpg',
          number: 100
        },
        subtitles: [
          {
            name: 'Default',
            default: true,
            src: '/君の名は.srt',
            offset: 2
          }
        ],
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
      },
      {
        title: 'Big Buck Bunny - HLS',
        src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        duration: '10:34'
      },
      {
        title: 'DASH',
        src: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
        duration: '10:34'
      },
      {
        title: 'FLV',
        src: '/op.flv',
        duration: '00:17'
      }
    ]
  })
]

const Preview = () => {
  const player = useRef()

  return (
    <div className={styles.Container} id="preview">
      <div className={styles.Title}>
        <Translate id="oplayer.preview">Preview</Translate>
      </div>
      <div>
        <ReactPlayer
          ref={player}
          plugins={plugins}
          source={{ src: '/君の名は.mp4', poster: '/poster.png' }}
          onEvent={console.log}
        />
      </div>
    </div>
  )
}

export default Preview
