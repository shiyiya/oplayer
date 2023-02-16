# oplayer-plugin-hls

[![npm](https://img.shields.io/npm/v/@oplayer/hls?style=flat-square&label=@oplayer/hls)](https://www.npmjs.com/package/@oplayer/hls)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/hls?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/hls?style=flat-square)](https://www.npmjs.com/package/@oplayer/hls)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/hls/badge)](https://www.jsdelivr.com/package/npm/@oplayer/hls)

Hls plugin for oplayer

## Install

```bash
# npm
npm i @oplayer/hls
# yarn
yarn add @oplayer/hls
# pnpm
yarn add @oplayer/hls
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.hls.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OHls()])
    .create()
</script>
```

## Usage

```ts
// type def
const defaultMatcher: hlsPluginOptions['matcher'] = (video, source) =>
  !(
    Boolean(video.canPlayType('application/x-mpegURL')) ||
    Boolean(video.canPlayType('application/vnd.apple.mpegURL'))
  ) &&
  (source.format === 'm3u8' || /m3u8(#|\?|$)/i.test(source.src))

type Options = {
  config?: Partial<HlsConfig>
  matcher?: (video: HTMLVideoElement, source: Source, force?: boolean) => boolean
  /**
   * enable quality control for the HLS stream, does not apply to the native (iPhone) clients.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched. default: immediate
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: false
   */
  withBitrate?: boolean
  audioControl?: boolean
  textControl?: boolean
  /**
   * @default false
   */
  showWarning?: boolean
}

import hls from '@oplayer/hls'

Player.make(...).use([hls()]).create()
```
