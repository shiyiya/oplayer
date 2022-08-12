# OPlayer

[Oh!](https://oplayer.vercel.app/) Another HTML5 video player.

[Demo](https://oplayer.vercel.app/) | [Basic Example](./examples/standalone/main.ts) | [React Example](./examples/react/src/main.tsx) | [Script Tag Example](./examples/umd.html)

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square&color=fb3e44)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@oplayer/ui?style=flat-square&label=ui)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@oplayer/react?style=flat-square&label=react)
[![](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)

![](./oplayer.png)

## Usage

```bash
pnpm i @oplayer/core @oplayer/ui
# or
yarn add @oplayer/core @oplayer/ui
```

```ts
import Player from '@oplayer/core'
import ui from '@oplayer/ui'

Player.make(document.body, {
  source: {
    src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    poster: 'https://media.w3.org/2010/05/sintel/poster.png'
  }
})
  .use([
    ui({
      theme: { primaryColor: '#9370db' },
      subtitle: [
        {
          text: 'English',
          type: 'vtt',
          default: true,
          url: 'https://s-sh-17-dplayercdn.oss.dogecdn.com/hikarunara.vtt'
        }
      ]
    })
  ])
  .create()
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.umd.js"></script>

<script>
  OPlayer.make(document.body, {
    source: {
      src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      poster: 'https://media.w3.org/2010/05/sintel/poster.png'
    }
  })
    .use([OUI(), OHls()])
    .create()
</script>
```

## Official plugin

- [@oplayer/ui](./packages//ui/)
- [@oplayer/hls](./packages/hls/)
- [@oplayer/torrent](./packages/torrent/)
- [@oplayer/danmuku](./packages/danmuku/)
- [@oplayer/react](./packages/react/)

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
