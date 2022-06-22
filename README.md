<center><h1>WIP</h1></center>

Another web video player.

## Usage

### ES

```bash
npm i @oplayer/core @oplayer/ui lit
```

```js
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/core/plugins/hls'
import { html, render } from 'lit'

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

```html
<script src="@oplayer/core/index.min.js"></script>
<script src="@oplayer/ui/index.min.js"></script>
<script src="@oplayer/core/plugins/hls.min.js"></script>

<script>
  PLayer.make(document.body, {
    volume: 1,
    autoplay: true,
    source: {
      src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      poster: 'https://media.w3.org/2010/05/sintel/poster.png'
    }
  })
    .use([OUI, OHLS])
    .create()
</script>
```
