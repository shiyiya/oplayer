# oplayer-plugin-mpegts

[![npm](https://img.shields.io/npm/v/@oplayer/mpegts?style=flat-square&label=@oplayer/mpegts)](https://www.npmjs.com/package/@oplayer/mpegts)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/mpegts?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/mpegts?style=flat-square)](https://www.npmjs.com/package/@oplayer/mpegts)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/mpegts/badge)](https://www.jsdelivr.com/package/npm/@oplayer/mpegts)

mpegts.js plugin for oplayer

## Install

```bash
# npm
npm i @oplayer/mpegts
# yarn
yarn add @oplayer/mpegts
# pnpm
yarn add @oplayer/mpegts
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
// type def
const REG = /flv|ts|m2ts(#|\?|$)/i

const defaultMatcher: Options['matcher'] = (_, source) => {
  if (source.format && ['flv', 'm2ts', 'mpegts'].includes(source.format)) {
    return true
  }

  return (source.format === 'auto' || typeof source.format === 'undefined') && REG.test(source.src)
}

type Options = {
  config?: Partial<Mpegts.Config>
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

import mpegts from '@oplayer/mpegts'

Player.make(...).use([mpegts()]).create()
```
