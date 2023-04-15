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
      source: { src: document.location.search.substring(1) },
      volume: 0.8
    })
      .use([ui({ keyboard: { global: true } }), hls({ forceHLS: true }), dash(), mpegts()])
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
          className="nx-mr-2 nx-block nx-w-full nx-appearance-none nx-rounded-lg nx-px-3 nx-py-2 nx-transition-colors nx-text-base nx-leading-tight md:nx-text-sm nx-bg-black/[.05] dark:nx-bg-gray-50/10 focus:nx-bg-white dark:focus:nx-bg-dark placeholder:nx-text-gray-500 dark:placeholder:nx-text-gray-400 contrast-more:nx-border contrast-more:nx-border-current"
        />
        <button
          className="nx-rounded-md"
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
      <div
        id="oplayer"
        className="aspect-video nx-bg-black/[.05] dark:nx-bg-gray-50/10 nx-rounded-md"
        aria-disabled={isFirst}
      />
    </div>
  )
}
