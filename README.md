# OPlayer

Oh! Another HTML5 video player.

Preview on https://oplayer.vercel.app/player?../君の名は.mp4

Website: https://oplayer.vercel.app | https://shiyiya.github.io/oplayer

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square&color=fb3e44)](https://www.npmjs.com/package/@oplayer/core)
[![GitHub license](https://img.shields.io/github/license/shiyiya/oplayer?style=flat-square)](https://github.com/shiyiya/oplayer/blob/main/LICENSE)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)
[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?style=flat-square)](#support)

![oplayer](./oplayer.png)

[Plugins](#plugins) | [Discord](https://discord.gg/hzjxYyPbKh) | [QQGroup](https://jq.qq.com/?_wv=1027&k=YzsRgkXB)

## Feature

- Streaming formats
  - [HLS](https://github.com/video-dev/hls.js)
  - [FLV](https://github.com/xqq/mpegts.js)
  - [MPEG DASH](https://github.com/Dash-Industry-Forum/dash.js)
  - [WebTorrent](https://github.com/webtorrent/webtorrent)
  - Any other custom streaming formats
- Media formats
  - MP4 H.264
  - WebM
  - Ogg Theora Vorbis
- Features
  - Danmaku
  - Screenshot
  - Hotkeys
  - Thumbnails
  - Subtitle
  - Highlight Marker

## Usage

### 1. Use the module manager to import:

```bash
npm i @oplayer/core @oplayer/ui @oplayer/hls hls.js
```

```ts
import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import hls from '@oplayer/hls'

Player.make(document.getElementById('oplayer'), {
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
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/hls@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OUI(), OHls()])
    .create()
</script>
```

## Plugins

- [@oplayer/ui](./packages/ui)
- [@oplayer/hls](./packages/hls)
- [@oplayer/dash](./packages/dash)
- [@oplayer/mpegts](./packages/mpegts)
- [@oplayer/shaka](./packages/shaka)
- [@oplayer/torrent](./packages/torrent)
- [@oplayer/danmaku](./packages/danmaku)
- [@oplayer/ad](./packages/ad)
- [@oplayer/react](./packages/react)
- [WordPress-Plugin](https://github.com/shiyiya/WordPress-Plugin-OPlayer)
- [Others Plugin](https://github.com/shiyiya/oplayer/issues/41)

## Who use OPlayer?

- [UPV](https://web.月色真美.life) : free animes no ad
- [enime.moe](https://enime.moe) : An anime streaming site. Just hop in and watch with speed without VPN or ads

## Support

If you think this is super cool, or useful, and want to donate a little, then you are also super cool!

|                                                                                                                           |                                                       |
| ------------------------------------------------------------------------------------------------------------------------: | ----------------------------------------------------- |
| <img src="https://user-images.githubusercontent.com/2817396/149629283-6002944f-9253-4e35-917d-89b476deae4e.png" width=20> | [$1 tip](https://www.paypal.com/paypalme/ShiYiYa/1)   |
| <img src="https://user-images.githubusercontent.com/2817396/149629283-6002944f-9253-4e35-917d-89b476deae4e.png" width=20> | [$5 tip](https://www.paypal.com/paypalme/ShiYiYa/5)   |
| <img src="https://user-images.githubusercontent.com/2817396/149629283-6002944f-9253-4e35-917d-89b476deae4e.png" width=20> | [$10 tip](https://www.paypal.com/paypalme/ShiYiYa/10) |
|                                                                             [微信](https://www.oaii.me/wechat_donate.png) | [WeChat Pay](https://www.oaii.me/wechat_donate.png)   |

## Jetbrains <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" width="35" height="35">

This project is helped by [Jetbrains](https://www.jetbrains.com/) with their open source program.
More informations [here](https://jb.gg/OpenSourceSupport)

I use these products:

<img src="https://resources.jetbrains.com/storage/products/company/brand/logos/IntelliJ_IDEA_icon.png" width="50" height="50"> <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/DataGrip_icon.png" width="50" height="50"> <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/WebStorm_icon.png" width="50" height="50"> <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/CodeWithMe_icon.png" width="50" height="50"> <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/Toolbox_icon.png" width="45" height="52">

# FAQ

https://stackoverflow.com/questions/14317179/display-a-video-from-a-blob-javascript/14360868#14360868
