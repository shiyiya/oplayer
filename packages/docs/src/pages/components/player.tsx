import React, { useEffect, useRef, useState } from 'react'
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import mpegts from '@oplayer/mpegts'
import style from './player.module.scss'

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

    return () => {
      player.current.destroy()
    }
  }, [])

  return (
    <div className={style.container}>
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
  )
}
