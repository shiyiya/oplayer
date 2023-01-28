# oplayer-plugin-dash

[![npm](https://img.shields.io/npm/v/@oplayer/ui?style=flat-square&label=@oplayer/dash)](https://www.npmjs.com/package/@oplayer/dash)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/dash?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/dash?style=flat-square)](https://www.npmjs.com/package/@oplayer/dash)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/dash/badge)](https://www.jsdelivr.com/package/npm/@oplayer/dash)

dash plugin for oplayer

## Install

```bash
# npm
npm i @oplayer/dash
# yarn
yarn add @oplayer/dash
# pnpm
yarn add @oplayer/dash
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<!--  dash FIRST  -->
<script src="http://cdn.dashjs.org/latest/dash.all.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/dash@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([ODash()])
    .create()
</script>
```

## Usage

```ts
// type def
const defaultMatcher: PluginOptions['matcher'] = (_, source) =>
  source.format === 'dash' ||
  source.format === 'mpd' ||
  ((source.format === 'auto' || typeof source.format === 'undefined') &&
    /.mpd(#|\?|$)/i.test(source.src))


type Options = {
  config?: MediaPlayerSettingClass
  matcher?: (video: HTMLVideoElement, source: Source) => boolean
  /**
   * enable quality control for the stream.
   * default: true
   */
  qualityControl?: boolean
  /**
   *  control how the stream quality is switched.
   *  @default: immediate
   *  @value immediate: Trigger an immediate quality level switch to new quality level. This will abort the current fragment request if any, flush the whole buffer, and fetch fragment matching with current position and requested quality level.
   *  @value smooth: Trigger a quality level switch for next fragment. This could eventually flush already buffered next fragment.
   */
  qualitySwitch?: 'immediate' | 'smooth'
  /**
   * @default: true
   */
  audioControl?: boolean
  /**
   * @default: true
   */
  textControl?: boolean
  /**
   * @default: false
   */
  withBitrate?: boolean
}

import dash from '@oplayer/dash'

Player.make(...).use([dash()]).create()
```
