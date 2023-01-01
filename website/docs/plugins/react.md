---
title: oplayer-plugin-react
---

## Usage

**注意：不需要重复创建 Player， 播放器大部分内容都支持动态加载**

```tsx
<!-- 这样会不断创建、销毁播放器 -->
{loading? <Player src=""> :null}

<!-- 加载时传递`""` -->
<Player src="">

<!-- 加载完成后更改 -->
useEffect(()=>{
  player.current?.changeSource(source)
},[source])

```

## Example ( from [web.月色真美.life](web.月色真美.life) )

```tsx
import type { PlayerEvent, Player, PlayerOptions } from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'
import ReactPlayer from '@oplayer/react'
import { useImperativeHandle, useRef } from 'react'
import React from 'react'

interface OPlayerProps extends PlayerOptions {
  src: string
  poster?: string
  playerIsPlaying?: boolean
  duration?: number
  autoplay?: boolean
  format?: string
  onEvent?: (event: PlayerEvent) => void
}

export type { PlayerEvent, Player }

const plugins = [
  ui({
    pictureInPicture: true,
    slideToSeek: 'always',
    screenshot: true,
    keyboard: { global: true }
  }),
  hls()
]

const OPlayer = React.forwardRef(
  ({ playerIsPlaying, src, poster, format, duration, onEvent, autoplay, ...rest }: OPlayerProps, ref) => {
    const _ref = useRef<Player>(null)

    useImperativeHandle(ref, () => _ref.current)

    return (
      <ReactPlayer
        ref={_ref}
        {...rest}
        plugins={plugins}
        onEvent={onEvent}
        autoplay={autoplay}
        duration={duration}
        source={{ src, poster, format }}
        playing={playerIsPlaying}
      />
    )
  }
)

export default OPlayer
```

