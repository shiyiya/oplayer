# oplayer-plugin-mpegts

[![npm](https://img.shields.io/npm/v/@oplayer/mpegts?style=flat-square&label=@oplayer/mpegts)](https://www.npmjs.com/package/@oplayer/mpegts)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/mpegts?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/mpegts?style=flat-square)](https://www.npmjs.com/package/@oplayer/mpegts)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/mpegts/badge)](https://www.jsdelivr.com/package/npm/@oplayer/mpegts)

[FLV](https://github.com/xqq/mpegts.js) plugin for oplayer

## Install

```bash
npm i @oplayer/core @oplayer/mpegts mpegts.js
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<!--  mpegts FIRST  -->
<script src="https://cdn.jsdelivr.net/npm/mpegts.js@latest/dist/mpegts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/mpegts@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'http://example.com/live/livestream.ts',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OMpegts()])
    .create()
</script>
```

## Usage

```ts
export type Matcher = (video: HTMLVideoElement, source: Source) => boolean

// active inactive
export type Active = (
  instance: Mpegts.Player,
  library: typeof Mpegts
) => void | ((instance: Mpegts.Player, library: typeof Mpegts) => void)

export type MpegtsPluginOptions = {
  config?: Partial<Mpegts.Config>
  matcher?: Matcher
  active?: Active
}
```
