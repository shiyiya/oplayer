<h1><center>WIP</center></h1>

[Example](./examples/standalone/main.ts) | [React Example](./examples/react/src/main.tsx)

[Oh!](https://shiyiya.github.io/oplayer) Another web video player.

![](./oplayer.png)

## Usage

```bash
pnpm i @oplayer/core @oplayer/ui @oplayer/hls
# or
yarn add  @oplayer/core @oplayer/ui @oplayer/hls
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.umd.js"></script>

<script>
  const player = Player.make($container, {
    source: {
      src,
      poster: 'https://media.w3.org/2010/05/sintel/poster.png'
    }
  }).use([OUI({ theme: { primaryColor: '#9370db' } }), OHls()])
</script>
```

```js
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hlsPlugin from '@oplayer/hls'

Player.make(document.body, {
  source: {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use([ui({ theme: { primaryColor: '#9370db' } }), hlsPlugin()]) // Optional
  .create()
```
