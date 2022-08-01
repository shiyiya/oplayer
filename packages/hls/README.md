# oplayer-plugin-hls

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
