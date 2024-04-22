# oplayer-plugin-mkv

[![npm](https://img.shields.io/npm/v/@oplayer/mkv?style=flat-square&label=@oplayer/mkv)](https://www.npmjs.com/package/@oplayer/mkv)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/mkv?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/mkv?style=flat-square)](https://www.npmjs.com/package/@oplayer/mkv)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/mkv/badge)](https://www.jsdelivr.com/package/npm/@oplayer/mkv)

[mkv] plugin for oplayer

## Install

```bash
npm i @oplayer/core @oplayer/mkv
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/@oplayer/mkv@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
    }
  })
    .use([OMkv()])
    .create()
</script>
```
