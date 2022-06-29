import React, { useRef, useState } from 'react'
import ui from '../../../packages/ui/dist'
import hls from '../../../packages/core/plugins/hls'
import ReactPlayer from '../../packages/react'

import { createRoot } from 'react-dom/client'

const playlist = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4',
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8'
]

const App = () => {
  const player = useRef(null)
  const [index, update] = useState(0)

  return (
    <div style={{ width: '980px', margin: '0 auto' }}>
      <ReactPlayer
        plugins={[ui(), hls()]}
        ref={player}
        source={{ src: playlist[index], poster: 'https://media.w3.org/2010/05/sintel/poster.png' }}
      />
      <hr />
      <button onClick={() => update(1)}>mp4</button>
      &nbsp;
      <button onClick={() => update(2)}>m3u8</button>
    </div>
  )
}

createRoot(document.getElementById('app')!).render(<App />)
