<h1 align="center">OPlayer</h1>

[Oh!](https://shiyiya.github.io/oplayer) Another web video player.

[Demo](https://shiyiya.github.io/oplayer) ｜ [Basic Example](./examples/standalone/main.ts) | [React Example](./examples/react/src/main.tsx) | [Script Tag Example](./examples/umd.html)

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

```ts
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

## Write a plugin

```ts
import { Player, PlayerPlugin } from '@oplayer/core'

const autoPipPlugin: PlayerPlugin = {
  name: 'oplayer-plugin-autopip',
  apply: (player: Player) => {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            player.exitPip()
          } else {
            player.enterPip()
          }
        })
      },
      { threshold: [0.15] }
    )

    intersectionObserver.observe(player.$root)
    player.on('destroy', () => {
      intersectionObserver.unobserve(player.$root)
    })
  }
}

Player.make(..options).use([autoPipPlugin]).create()
```

## Who use OPlayer?

- [UPV](https://月色真美.life) : free animes no ad
