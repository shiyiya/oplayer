# OPlayer

⚡ Oh! Another HTML5 video player.

https://oplayer.vercel.app ・ https://ohplayer.netlify.app

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
[![GitHub license](https://img.shields.io/github/license/shiyiya/oplayer?style=flat-square)](https://github.com/shiyiya/oplayer/blob/main/LICENSE)
[![npm dt](https://img.shields.io/npm/dt/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)
[![Discord](https://img.shields.io/discord/1017615537234264185.svg?label=&logo=discord&logoColor=fff&color=7389D8&labelColor=6A7EC2&style=flat-square)](https://discord.gg/hzjxYyPbKh)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1dac4911-935b-43a0-a69d-15c98e2668ed/deploy-status)](https://app.netlify.com/sites/ohplayer/deploys)

![oplayer](./oplayer.png)

## Feature

- Streaming formats
  - [HLS](./packages/hls) (track, subtitles, audio track selection)
  - [MPEG DASH](./packages/dash) (track, subtitles (also segmented), audio track selection)
  - [FLV](./packages/mpegts)
  - [WebTorrent](./packages/torrent)
  - Any other custom streaming formats
- Features
  - Danmaku
  - Screenshot
  - Hotkeys
  - Thumbnails (spirit or vtt)
  - Subtitles (formats: SRT, WEBVTT with HTML tags support; subtitles from HLS; multiple subtitles for video)
  - Highlight Marker
  - [Playlist](./packages/plugins/README.md#playlist)
  - ... and much more!

## Usage

### 1. Use the module manager to import:

```bash
npm i @oplayer/core @oplayer/ui @oplayer/hls
```

```ts
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'

Player.make('#oplayer', {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([ui(), hls()])
  .create()
```

### 2. Use the script tag to introduce:

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.ui.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.hls.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OPlayer.ui(), OHls()])
    .create()
</script>
```

## Plugins

- [![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square&label=@oplayer/core)](./packages/core)
- [![npm](https://img.shields.io/npm/v/@oplayer/ui?style=flat-square&label=@oplayer/ui)](./packages/ui)
- [![npm](https://img.shields.io/npm/v/@oplayer/hls?style=flat-square&label=@oplayer/hls)](./packages/hls)
- [![npm](https://img.shields.io/npm/v/@oplayer/dash?style=flat-square&label=@oplayer/dash)](./packages/dash)
- [![npm](https://img.shields.io/npm/v/@oplayer/mpegts?style=flat-square&label=@oplayer/mpegts)](./packages/mpegts)
- [![npm](https://img.shields.io/npm/v/@oplayer/torrent?style=flat-square&label=@oplayer/torrent)](./packages/torrent)
- [![npm](https://img.shields.io/npm/v/@oplayer/danmaku?style=flat-square&label=@oplayer/danmaku)](./packages/danmaku)
- [![npm](https://img.shields.io/npm/v/@oplayer/vast?style=flat-square&label=@oplayer/vast)](./packages/vast)
- [![npm](https://img.shields.io/npm/v/@oplayer/react?style=flat-square&label=@oplayer/react)](./packages/react)
- [![npm](https://img.shields.io/npm/v/@oplayer/plugins?style=flat-square&label=@oplayer/plugins)](./packages/plugins)

- [WordPress-Plugin](https://github.com/shiyiya/WordPress-Plugin-OPlayer)
- [Others Plugin](https://github.com/shiyiya/oplayer/issues/41)
- [Others Plugin](https://github.com/shiyiya/oplayer/issues/41)
- [QQ 群](https://jq.qq.com/?_wv=1027&k=YzsRgkXB)

## Who use OPlayer?

- [UPV](https://web.月色真美.life) : free animes no ad
- [enime.moe](https://enime.moe) : An anime streaming site. Just hop in and watch with speed without VPN or ads
- **Feel free to submit yours in [Let me know!](https://github.com/shiyiya/oplayer/issues/new)**

## Support

If you think this is super cool, or useful, and want to donate a little, then you are also super cool!

- [Paypal](https://www.paypal.com/paypalme/ShiYiYa)
- [WeChat Pay](https://www.oaii.me/wechat_donate.png)

## Jetbrains <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" width="35" height="35">

This project is helped by [Jetbrains](https://www.jetbrains.com/) with their open source program.
More information [here](https://jb.gg/OpenSourceSupport)
