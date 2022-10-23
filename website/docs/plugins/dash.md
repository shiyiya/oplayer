---
title: oplayer-plugin-dash
---

```bash npm2yarn
npm install --save @oplayer/dash
```

## 使用

<Tabs>
<TabItem value="js" label="npm">

```js
import Player from '@oplayer/core'
import dash from '@oplayer/dash'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([dash()])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/dash@latest/dist/index.umd.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([ODash()])
    .create()
</script>
```

</TabItem>

</Tabs>

## 参数

```ts
type dashPluginOptions = {
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  setting?: MediaPlayerSettingClass
  options?: {
    /**
     * @default: false
     */
    withBitrate?: boolean
  }
}
```
