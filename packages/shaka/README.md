# oplayer-plugin-shaka

[![npm](https://img.shields.io/npm/v/@oplayer/shaka?style=flat-square&label=@oplayer/shaka)](https://www.npmjs.com/package/@oplayer/shaka)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/shaka?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/shaka?style=flat-square)](https://www.npmjs.com/package/@oplayer/shaka)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/shaka/badge)](https://www.jsdelivr.com/package/npm/@oplayer/shaka)

[shaka-player](https://github.com/shaka-project/shaka-player) plugin for oplayer

## Install

```bash
npm i @oplayer/hls shaka-player
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/shaka@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
    }
  })
    .use([
      OShaka({
        library: 'https://cdn.jsdelivr.net/npm/shaka-player@2.5.10/dist/shaka-player.compiled.min.js'
      })
    ])
    .create()
</script>
```
