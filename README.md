<h1><center>WIP</center></h1>

[Example](./examples/standalone/main.ts) | [React Example](./examples/react/src/main.tsx)

[Oh!](https://shiyiya.github.io/oplayer) Another web video player.

![](./oplayer.png)

## Usage

```bash
pnpm i @oplayer/core @oplayer/ui
# or
yarn add  @oplayer/core @oplayer/ui
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.umd.js"></script>
```

```js
import Player, { hlsPlugin } from '@oplayer/core'
import ui from '@oplayer/ui'

Player.make(document.body, {
  source: {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use([ui({ theme: { primaryColor: '#9370db' } }), hlsPlugin()]) // Optional
  .create()
```
