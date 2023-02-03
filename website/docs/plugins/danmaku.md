---
title: oplayer-plugin-danmaku
---

```bash npm2yarn
npm install --save @oplayer/danmaku
```

More Info: https://github.com/shiyiya/oplayer/tree/main/packages/danmaku

## 使用

<Tabs>
<TabItem value="js" label="npm">

```js
import Player from '@oplayer/core'
import danmaku from '@oplayer/danmaku'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([danmaku()])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/danmaku@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([ODanmaku()])
    .create()
</script>
```

</TabItem>

</Tabs>

## 参数

```ts
export type Options = {
  source: string | Function | DanmakuItem[]
  speed?: number // 持续时间 秒，[1 ~ 10]
  antiOverlap?: boolean // 是否防重叠
  useWorker?: boolean
  synchronousPlayback?: boolean // 是否同步到播放速度
  opacity?: number
  fontSize?: number
  margin?: [number, number]
  filter?: (danmaku: DanmakuItem) => boolean
}
```
