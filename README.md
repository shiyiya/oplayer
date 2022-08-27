# OPlayer

Oh! Another HTML5 video player.

Website: https://oplayer.vercel.app/

Examples: [./examples](./examples) | [Join QQGroup](https://jq.qq.com/?_wv=1027&k=YzsRgkXB)

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square&color=fb3e44)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@oplayer/ui?style=flat-square&label=ui)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@oplayer/react?style=flat-square&label=react)
![npm dw](https://img.shields.io/npm/dw/@oplayer/core?style=flat-square)
[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?style=flat-square)](https://paypal.me/ShiYiYa)

![oplayer](./oplayer.png)

## Usage

```bash
pnpm i @oplayer/core @oplayer/ui @oplayer/danmaku
# or
yarn add @oplayer/core @oplayer/ui @oplayer/danmaku
```

```ts
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import danmaku from '@oplayer/danmaku'

Player.make(document.body, {
  source: { src: 'https://oplayer.vercel.app/君の名は.mp4' }
})
  .use([
    danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml' }),
    ui({
      theme: { primaryColor: '#f00' },
      subtitle: [
        {
          name: '君の名は',
          default: true,
          url: 'https://oplayer.vercel.app/君の名は.srt'
        }
      ],
      thumbnails: { url: 'https://oplayer.vercel.app/thumbnails.jpg', number: 100 }
    })
  ])
  .create()
```

## Official plugin

- [@oplayer/ui](./packages//ui/)
- [@oplayer/hls](./packages/hls/)
- [@oplayer/torrent](./packages/torrent/)
- [@oplayer/danmaku](./packages/danmaku/)
- [@oplayer/react](./packages/react/)

## Who use OPlayer?

- [UPV](https://月色真美.life) : free animes no ad
- ...

## Thanks

- [Boy\_\_Yan](https://www.iconfont.cn/collections/detail?cid=40262)
- [1214monkey](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=12086)
