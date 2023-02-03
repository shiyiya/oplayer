---
title: oplayer-plugin-torrent
---

```bash npm2yarn
npm install --save @oplayer/torrent
```

More Info: https://github.com/shiyiya/oplayer/tree/main/packages/torrent

## 使用

<Tabs>
<TabItem value="js" label="npm">

```js
import Player from '@oplayer/core'
import torrent from '@oplayer/torrent'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([torrent()])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/torrent@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OTorrent()])
    .create()
</script>
```

</TabItem>

</Tabs>

## 参数

```ts
type torrentPluginOptions = {
  config?: Record<string, any> // https://webtorrent.io
  matcher?: (src: Source) => boolean
}
```
