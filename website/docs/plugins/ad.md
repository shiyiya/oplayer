---
title: oplayer-plugin-ad
---

```bash npm2yarn
npm install --save @oplayer/ad
```

## 使用

<Tabs>
<TabItem value="js" label="npm">

```js
import Player from '@oplayer/core'
import ad from '@oplayer/ad'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([ad()])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ad@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OAD()])
    .create()
</script>
```

</TabItem>

</Tabs>

## 参数

```ts
type Options = {
  video?: string
  image?: string
  autoplay?: boolean
  plugins?: PlayerPlugin
  skipDuration?: number
  duration: number
  target?: string
  onSkip?: (duration: number) => void
}
```
