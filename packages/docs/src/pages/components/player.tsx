import React, { useEffect, useRef, useState } from 'react'
import Player, { PlayerPlugin } from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import dash from '@oplayer/dash'
import mpegts from '@oplayer/mpegts'
import style from './player.module.scss'
import { Chromecast } from '@oplayer/plugins'

const userPreferencesPlugin: PlayerPlugin = {
  name: 'userPreferencesPlugin',
  apply(player) {
    player.on('ratechange', () => {
      // 首次调用changeSource且上一次视频地址为空时会触发 ratechange = 1
      if (!player.isSourceChanging)
        localStorage.setItem('@oplayer/UserPreferences/speed', player.playbackRate.toString())
    })

    player.on('volumechange', () => {
      localStorage.setItem('@oplayer/UserPreferences/volume', player.volume.toString())
    })
  }
}

export default () => {
  const player = useRef<Player>()
  const [input, setInput] = useState(globalThis.location?.search.substring(1))
  const [isFirst, setIsFirst] = useState(true)

  useEffect(() => {
    player.current = Player.make('#oplayer', {
      source: { src: input },
      playbackRate: +(localStorage.getItem('@oplayer/UserPreferences/speed') || 1),
      volume: +(localStorage.getItem('@oplayer/UserPreferences/volume') || 1)
    })
      .use([
        ui({
          keyboard: { global: true },
          menu: [
            {
              name: 'WEBFULL',
              icon: `<svg viewBox="0 0 1024 1024" style="transform: scale(0.7)"><path d="M85.333333 768v170.666667h170.666667v85.333333H0v-256h85.333333z m938.666667 0v256h-256v-85.333333h170.666667v-170.666667h85.333333zM640 256a128 128 0 0 1 128 128v256a128 128 0 0 1-128 128H384a128 128 0 0 1-128-128V384a128 128 0 0 1 128-128h256zM256 0v85.333333H85.333333v170.666667H0V0h256z m768 0v256h-85.333333V85.333333h-170.666667V0h256z"></path></svg>`,
              onClick() {
                player.current?.emit('fullscreenchange', { isWeb: true })
              }
            }
          ]
        }),
        hls({ forceHLS: true }),
        dash(),
        mpegts(),
        userPreferencesPlugin,
        new Chromecast()
      ])
      .create()
      .on(console.log)

    if (input) {
      setIsFirst(false)
    }

    return () => {
      player.current!.destroy()
    }
  }, [])

  return (
    <div className={style.container}>
      <div className="form">
        <input
          required
          type="text"
          placeholder="https://example.com/test-hls/index.m3u8"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="nx-mr-2 nx-block nx-w-full nx-appearance-none nx-rounded-sm nx-px-3 nx-py-2 nx-transition-colors nx-text-base nx-leading-tight md:nx-text-sm nx-bg-black/[.05] dark:nx-bg-gray-50/10 focus:nx-bg-white dark:focus:nx-bg-dark placeholder:nx-text-gray-500 dark:placeholder:nx-text-gray-400 contrast-more:nx-border contrast-more:nx-border-current"
        />
        <button
          className="nx-rounded-md"
          type="button"
          onClick={() => {
            if (input) {
              player.current!.changeSource({ src: input })
              setIsFirst(false)
            }
          }}
        >
          PLAY
        </button>
      </div>
      <p className="tips">
        Your streaming URL must be HTTPS-compatible, otherwise your stream may not play. Make sure CORS is
        enabled on streaming server when using HLS and MPEG-DASH streams.
      </p>
      <div
        id="oplayer"
        className="nx-bg-black/[.05] dark:nx-bg-gray-50/10 nx-rounded-sm"
        aria-disabled={isFirst}
      />
    </div>
  )
}
