# OPlayer

Oh! Another HTML5 video player.

[Examples](./examples) | [Contributing](./CONTRIBUTING.md)
| [Discord](https://discord.gg/hzjxYyPbKh) | [QQGroup](https://jq.qq.com/?_wv=1027&k=YzsRgkXB)

Website: https://oplayer.vercel.app | https://shiyiya.github.io/oplayer

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square&color=fb3e44)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
![npm dw](https://img.shields.io/npm/dw/@oplayer/core?style=flat-square)
[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?style=flat-square)](https://paypal.me/ShiYiYa)

![oplayer](./oplayer.png)

## Usage

### 1. Use the module manager to import:

```bash
npm i @oplayer/core @oplayer/ui @oplayer/hls
```

```ts
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([ui(), hls()])
  .create()
```

### 2. Use the script tag to introduce:

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.umd.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OUI(), OHls()])
    .create()
</script>
```

## Plugins

- [@oplayer/ui](./packages/ui/)
- [@oplayer/dash](./packages/dash/)
- [@oplayer/torrent](./packages/torrent/)
- [@oplayer/danmaku](./packages/danmaku/)
- [@oplayer/react](./packages/react/)

## Who use OPlayer?

- [UPV](https://月色真美.life) : free animes no ad
- [enime.moe](https://enime.moe) : An anime streaming site. Just hop in and watch with speed without VPN or ads
