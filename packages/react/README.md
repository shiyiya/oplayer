# oplayer-plugin-torrent

[![npm](https://img.shields.io/npm/v/@oplayer/react?style=flat-square&label=@oplayer/react)](https://www.npmjs.com/package/@oplayer/react)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/react?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/react?style=flat-square)](https://www.npmjs.com/package/@oplayer/react)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/react/badge)](https://www.jsdelivr.com/package/npm/@oplayer/react)

React wrapper for oplayer. (NOT WORKING ON REACT STRICT MODE)

## Install

```bash
npm i @oplayer/core @oplayer/torrent
```

```tsx
import ReactPlayer from '@oplayer/react'

const plugins = [
  ui({
    pictureInPicture: true,
    slideToSeek: 'always',
    screenshot: true,
    keyboard: { global: true }
  }),
  hls()
]

function playPage() {
  const [source, setSource] = useState<any>()
  const player = useRef<Player>(null)

  useEffect(() => {
    setSource(
      // Be a Promise or raw
      fetch(`xxxx`).then((it) => {
        return it
      })
    )
  }, [lastEpisode])

  return (
    <>
      <h1>Now Playing "君の名は"</h1>

      <ReactPlayer
        plugins={plugins}
        ref={player}
        autoplay={true}
        source={source}
        duration={lastDuration}
        isLive={id == 'iptv'}
        onEvent={(e) => {}}
      />
    </>
  )
}
```
