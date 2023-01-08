# oplayer-plugin-hls

[![npm](https://img.shields.io/npm/v/@oplayer/ui?style=flat-square&label=@oplayer/hls)](https://www.npmjs.com/package/@oplayer/hls)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/hls?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/hls?style=flat-square)](https://www.npmjs.com/package/@oplayer/hls)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/hls/badge)](https://www.jsdelivr.com/package/npm/@oplayer/hls)

Hls plugin for oplayer

## Usage

```ts
// type def
const defaultMatcher: hlsPluginOptions['matcher'] = (video, source) =>
  !(
    Boolean(video.canPlayType('application/x-mpegURL')) ||
    Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
  ) &&
  (source.format === 'm3u8' || /m3u8(#|\?|$)/i.test(source.src))

type hlsPluginOptions = {
  hlsConfig?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
}

import hls from '@oplayer/hls'

const options: hlsPluginOptions

Player.make(...).use([hls(options)]).create()
```
