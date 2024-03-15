# OPlayer

⚡ Oh! Another HTML5 video player.

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
[![npm dt](https://img.shields.io/npm/dm/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)
[![Discord](https://img.shields.io/discord/1017615537234264185.svg?label=&logo=discord&logoColor=fff&color=7389D8&labelColor=6A7EC2&style=flat-square)](https://discord.gg/hzjxYyPbKh)

![oplayer](./oplayer.png)

## Documentation

- https://oplayer.vercel.app
- https://ohplayer.netlify.app
- [Standalone Demo](https://oplayer.vercel.app/ohls.html?playlist=%5B%7B"title"%3A"Disney%27s+Oceans+-+MP4"%2C"src"%3A"https%3A%2F%2Fvjs.zencdn.net%2Fv%2Foceans.mp4"%2C"poster"%3A"https%3A%2F%2Fvjs.zencdn.net%2Fv%2Foceans.png"%2C"duration"%3A"00%3A46"%7D%2C%7B"title"%3A"Big+Buck+Bunny+-+HLS"%2C"src"%3A"https%3A%2F%2Ftest-streams.mux.dev%2Fx36xhzz%2Fx36xhzz.m3u8"%2C"poster"%3A"https%3A%2F%2Fd2zihajmogu5jn.cloudfront.net%2Fbig-buck-bunny%2Fbbb.png"%2C"duration"%3A"10%3A34"%7D%2C%7B"title"%3A"Big+Buck+Bunny+-+DASH"%2C"src"%3A"https%3A%2F%2Fdash.akamaized.net%2Fakamai%2Fbbb_30fps%2Fbbb_30fps.mpd"%2C"poster"%3A"https%3A%2F%2Fd2zihajmogu5jn.cloudfront.net%2Fbig-buck-bunny%2Fbbb.png"%2C"duration"%3A"10%3A34"%7D%5D)

## Who use OPlayer?

- **Feel free to submit yours in [Let me know!](https://github.com/shiyiya/oplayer/discussions/116)**
- [UPV](https://onime.netlify.app) : free anime no ad.
- [Animex](https://www.animex.live/) : Watch Anime for free in HD quality with English subbed or dubbed.
- ~~[NGEWIBU.TV](https://ngewibu.tv/) : Nonton Anime Sub Indo | Nonton Anime Subtitle Indonesia Gratis~~

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
  - Thumbnails (spirit or [vtt](https://oplayer.vercel.app/plugins/vtt-thumbnails))
  - Subtitles (formats: SRT, WEBVTT with HTML tags support; subtitles from HLS; multiple subtitles for video)
  - [Chromecast](https://oplayer.vercel.app/plugins/chromecast)
  - [Playlist](https://oplayer.vercel.app/plugins/playlist)
  - ... and much more!

## Support

If you think this is super cool, or useful, and want to donate a little, then you are also super cool!

- PR WELCOME ！
- [Paypal](https://www.paypal.com/paypalme/ShiYiYa)
- [WeChat Pay](https://www.oaii.me/wechat_donate.png)

- ![Star](https://img.shields.io/github/stars/shiyiya/oplayer?style=social)

## Jetbrains <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.png" width="35" height="35">

This project is helped by [Jetbrains](https://www.jetbrains.com/) with their open source program.
More information [here](https://jb.gg/OpenSourceSupport)
