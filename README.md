# OPlayer

[Oh!](https://oplayer.vercel.app/) Another HTML5 video player.

[Demo](https://oplayer.vercel.app/) | [Basic Example](./examples/standalone/main.ts) | [React Example](./examples/react/src/main.tsx) | [Script Tag Example](./examples/umd.html) | [Join QQGroup](https://jq.qq.com/?_wv=1027&k=YzsRgkXB)

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
import danmuku from '@oplayer/danmuku'

Player.make(document.body, {
  source: { src: 'https://oplayer.vercel.app/君の名は.mp4' }
})
  .use([
    danmuku({ source: 'https://oplayer.vercel.app/danmuku.xml' }),
    ui({
      theme: { primaryColor: '#9370db' },
      subtitle: [
        {
          name: '君の名は',
          default: true,
          url: 'https://oplayer.vercel.app/君の名は.srt'
        }
      ]
    })
  ])
  .create()
```

## Official plugin

- [@oplayer/ui](./packages//ui/)
- [@oplayer/hls](./packages/hls/)
- [@oplayer/torrent](./packages/torrent/)
- [@oplayer/danmuku](./packages/danmuku/)
- [@oplayer/react](./packages/react/)

## Who use OPlayer?

- [UPV](https://月色真美.life) : free animes no ad
- ...

## Thanks

- [Boy\_\_Yan](https://www.iconfont.cn/collections/detail?cid=40262)
- [1214monkey](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=12086)
