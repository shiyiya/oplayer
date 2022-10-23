---
title: oplayer-plugin-hls
---

```bash npm2yarn
npm install --save @oplayer/hls
```

## 使用

<Tabs>
<TabItem value="js" label="npm">

```js
import Player from '@oplayer/core'
import hls from '@oplayer/hls'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([hls()])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.umd.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OHls()])
    .create()
</script>
```

</TabItem>

</Tabs>

## 参数

```ts
type hlsPluginOptions = {
  hlsConfig?: Partial<HlsConfig> // 传递给 hls.js 的参数

  // 匹配当前播放 url 是否是该格式 返回false将不会启用 hls.js
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  options?: {
    /**
     * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
     * default: false
     */
    hlsQualityControl?: boolean
    /**
     *  control how the stream quality is switched. default: smooth
     *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
     *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
     */
    hlsQualitySwitch?: 'immediate' | 'smooth'
    /**
     * @default: false
     */
    withBitrate?: boolean
  }
}
```
