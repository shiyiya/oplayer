# oplayer-plugin-hls

[![npm](https://img.shields.io/npm/v/@oplayer/hls?style=flat-square&label=@oplayer/hls)](https://www.npmjs.com/package/@oplayer/hls)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/hls?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/hls?style=flat-square)](https://www.npmjs.com/package/@oplayer/hls)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/hls/badge)](https://www.jsdelivr.com/package/npm/@oplayer/hls)

[HLS](https://github.com/video-dev/hls.js) plugin for oplayer

## Install

```bash
npm i @oplayer/core @oplayer/hls hls.js
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>

<!-- 1 -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.index.js"></script>

<!-- or -->
<!-- hls + hls plugin -->
<!-- <script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.hls.js"></script> -->

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
export type Matcher = (video: HTMLVideoElement, source: Source, forceHLS: boolean) => boolean

// active inactive
export type Active = (
  instance: Hls,
  library: typeof import('hls.js/dist/hls.min.js')
) => void | ((instance: Hls, library: typeof import('hls.js/dist/hls.min.js')) => void)

export interface HlsPluginOptions {
  matcher?: Matcher
  /**
   * active or inactive(returned fn)
   *
   * @type {Active}
   */
  active?: Active
  /**
   * config for hls.js
   *
   * @type {Partial<HlsConfig>}
   */
  config?: Partial<HlsConfig>
  /**
   * force use hls.js
   * @type {boolean} false
   */
  forceHLS?: boolean
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
  /**
   * @default: true
   */
  audioControl?: boolean
  /**
   * @default: true
   */
  textControl?: boolean
}
```

## Handle Hls.js Error **v1.2.24.beta.0+**

```ts
OPlayer.make('#oplayer', {
  source: {
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([
    OHls({
      errorHandler(player, data, cb) {
        // skip bufferAppendError
        if (data.details == 'bufferAppendError') return

        cb(player, data)
      }
    })
  ])
  .create()
```
