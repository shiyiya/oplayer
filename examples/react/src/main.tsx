import { useRef, useState } from 'react'
import ReactPlayer from '@oplayer/react'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import Playground from './playground/index'

//@ts-ignore
import { createRoot } from 'react-dom/client'
import Player, { PlayerEvent, VIDEO_EVENTS } from '@oplayer/core'

const playlist = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4',
  'https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8'
]

const plugins = [ui(), hls()]

const App = () => {
  const [alive, setAlive] = useState(true)
  const [index, update] = useState(-1)
  const player = useRef<Player | null>(null)

  if (document.location.pathname == '/react') {
    // return <Playground />
  }

  return (
    <div style={{ width: '980px', margin: '0 auto' }}>
      {alive ? (
        <ReactPlayer
          ref={player}
          autoplay={true}
          duration={5000}
          plugins={plugins}
          source={{
            src: playlist[index]!,
            poster: 'https://media.w3.org/2010/05/sintel/poster.png'
          }}
          onEvent={(e: PlayerEvent) => {
            if (Object.values(VIDEO_EVENTS).includes(e.type as any) && e.type != 'timeupdate') {
              console.log(e)
            }
          }}
        />
      ) : null}
      <hr />
      <button onClick={() => update(0)}>setup</button>
      &nbsp;
      <button onClick={() => update(1)}>mp4</button>
      &nbsp;
      <button onClick={() => update(2)}>m3u8</button>
      &nbsp;
      <button onClick={() => setAlive(true)}>create</button>
      &nbsp;
      <button onClick={() => setAlive(false)}>destroy</button>
    </div>
  )
}

createRoot(document.getElementById('app')!).render(<App />)
