# oplayer-plugin-hls

[![npm](https://img.shields.io/npm/v/@oplayer/hls?style=flat-square&label=@oplayer/hls)](https://www.npmjs.com/package/@oplayer/hls)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/hls?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/hls?style=flat-square)](https://www.npmjs.com/package/@oplayer/hls)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/hls/badge)](https://www.jsdelivr.com/package/npm/@oplayer/hls)

[HLS](https://github.com/video-dev/hls.js) plugin for oplayer

## Install

```bash
npm i @oplayer/hls hls.js
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.index.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
    }
  })
    .use([OHls({ library: 'https://cdn.jsdelivr.net/npm/hls.js@0.14.17/dist/hls.min.js' })])
    .create()
</script>
```

## Handle default Quality/Audio/Subtitle

```js
OHls({
  forceHLS: true, // use hls.js not native
  defaultQuality(levels) {
    let index = -1 // -1 => 'auto'
    for (const { height, id } of levels) {
      if (height <= 1080) index = id
    }
    return i
  },
  defaultAudio(tracks) {
    for (const { lang, id } of object) {
      if (lang == 'en' || lang.startsWith('en')) {
        return id
      }
    }

    return -1 // -1 => brower lang
  },
  defaultSubtitle(tracks) {
    for (const { lang, id } of object) {
      if (lang == 'en' || lang.startsWith('en')) {
        return id
      }
    }

    return -1 // -1 => brower lang
  }
})
```

## Handle Hls.js Error

```ts
OHls({
  errorHandler(player, data) {
    // skip bufferAppendError
    if (data.details == 'bufferAppendError') return

    player.emit('error', {
      ...data,
      message: data.type + ': ' + data.details
    })
  }
})
```
