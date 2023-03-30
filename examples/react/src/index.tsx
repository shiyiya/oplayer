import { createRoot } from 'react-dom/client'
import React from 'react'
import Player from '@oplayer/react'
import hls from '@oplayer/hls'
import ui from '@oplayer/ui'
import { vttThumbnails } from '@oplayer/plugins'

const App: React.FC = () => {
  return (
    <Player
      source={{
        src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        poster: 'https://oplayer.vercel.app/poster.png'
      }}
      plugins={[
        ui(),
        hls(),
        vttThumbnails({
          src: 'https://preview.zorores.com/4b/4b1a02c7ffcad4f1ee11cd6f474548cb/thumbnails/sprite.vtt'
        })
      ]}
    />
  )
}

createRoot(document.getElementById('root')!).render(<App />)
