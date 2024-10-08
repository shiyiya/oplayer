# oplayer-plugin-torrent

[![npm](https://img.shields.io/npm/v/@oplayer/torrent?style=flat-square&label=@oplayer/torrent)](https://www.npmjs.com/package/@oplayer/torrent)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/torrent?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/torrent?style=flat-square)](https://www.npmjs.com/package/@oplayer/torrent)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/torrent/badge)](https://www.jsdelivr.com/package/npm/@oplayer/torrent)

[WebTorrent](https://github.com/webtorrent/webtorrent) plugin for oplayer

## Install

**MUST webtorrent@0.98.18**

```bash
# webtorrent@0.98.18 !!
npm i @oplayer/core @oplayer/torrent webtorrent@0.98.18
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/torrent@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      title: 'sintel',
      src: 'https://webtorrent.io/torrents/sintel.torrent',
      poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
    }
  })
    .use([OTorrent({ library: 'https://cdn.jsdelivr.net/npm/webtorrent@0.98.18/webtorrent.min.js' })])
    .create()
</script>
```
