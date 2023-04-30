# oplayer-plugin-torrent

[![npm](https://img.shields.io/npm/v/@oplayer/torrent?style=flat-square&label=@oplayer/torrent)](https://www.npmjs.com/package/@oplayer/torrent)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/torrent?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/torrent?style=flat-square)](https://www.npmjs.com/package/@oplayer/torrent)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/torrent/badge)](https://www.jsdelivr.com/package/npm/@oplayer/torrent)

[WebTorrent](https://github.com/webtorrent/webtorrent) plugin for oplayer

## Install

```bash
npm i @oplayer/core @oplayer/torrent webtorrent
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<!--  webtorrent FIRST  -->
<script src="https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/torrent@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'http://example.com/live/livestream.ts',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OTorrent()])
    .create()
</script>
```
