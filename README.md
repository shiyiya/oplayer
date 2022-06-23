<h1><center>WIP</center></h1>

[Oh!](https://shiyiya.github.io/oplayer) Another web video player.

![](./oplayer.png)

## Usage

### ES

```bash
npm i @oplayer/core @oplayer/ui lit
```

```js
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/core/plugins/hls'

Player.make(document.body, {
  volume: 1,
  autoplay: true,
  source: {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use([ui, hls])
  .create()
```

### UMD
