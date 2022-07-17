<h1 align="center">OPlayer</h1>

[Oh!](https://shiyiya.github.io/oplayer) Another web video player.

[Example](./examples/standalone/main.ts) | [React Example](./examples/react/src/main.tsx)

[![npm](https://flat.badgen.net/npm/v/@oplayer/core/?color=fb3e44)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square)
[![](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)

![](./oplayer.png)

## Usage

```bash
pnpm i @oplayer/core @oplayer/ui @oplayer/hls
# or
yarn add @oplayer/core @oplayer/ui @oplayer/hls
```

```js
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'

Player.make(document.body, {
  source: {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use([ui({ theme: { primaryColor: '#9370db' } }), hls()]) // Optional
  .create()
```

## Who use OPlayer?

- [UPV](https://月色真美.life) : free animes no ad
