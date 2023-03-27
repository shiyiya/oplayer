import Layout from '@theme/Layout'
import React, { useEffect, useRef, useState } from 'react'
import { Player } from '../../../packages/core/dist/index.es'
import dash from '../../../packages/dash/dist/index.es'
import hls from '../../../packages/hls/dist/index.es'
import mpegts from '../../../packages/mpegts/dist/index.es'
import ui from '../../../packages/ui/dist/index.es'
import './player.scss'

export default () => {
  const player = useRef<Player>()
  const [input, setInput] = useState('')
  const [isFirst, setIsFirst] = useState(true)

  useEffect(() => {
    player.current = Player.make('#oplayer', {
      source: { src: document.location.search.substring(1) }
    })
      .use([ui(), hls(), dash(), mpegts()])
      .create()
      .on(console.log)

    if (document.location.search.substring(1)) {
      setIsFirst(false)
    }
  }, [])

  return (
    <Layout
      title="Start streaming now using OPlayer - Free HTML5 Player"
      description="Start streaming now using OPlayer. Embed HLS,dash,flv,mpegts,mp4 on your website using Free HTML5 Player. Live Stream Now!"
    >
      <div className="container">
        <div className="form">
          <input
            required
            type="text"
            placeholder="https://example.com/test-hls/index.m3u8"
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (input) {
                player.current.changeSource({ src: input })
                setIsFirst(false)
              }
            }}
          >
            PLAY
          </button>
        </div>
        <p className="tips">
          Your streaming URL must be HTTPS-compatible, otherwise your stream may not play. Make sure
          CORS is enabled on streaming server when using HLS and MPEG-DASH streams.
        </p>
        <div id="oplayer" aria-disabled={isFirst} />
      </div>
    </Layout>
  )
}
