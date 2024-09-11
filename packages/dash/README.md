# oplayer-plugin-dash

[![npm](https://img.shields.io/npm/v/@oplayer/dash?style=flat-square&label=@oplayer/dash)](https://www.npmjs.com/package/@oplayer/dash)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/dash?style=flat-square)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/dash?style=flat-square)](https://www.npmjs.com/package/@oplayer/dash)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/dash/badge)](https://www.jsdelivr.com/package/npm/@oplayer/dash)

[MPEG DASH](https://github.com/Dash-Industry-Forum/dash.js) plugin for oplayer

## Install

```bash
npm i @oplayer/core @oplayer/dash dashjs
```

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/dash@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make('#oplayer', {
    source: {
      src: 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd',
      poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
    }
  })
    .use([ODash({ library: 'https://cdn.dashjs.org/latest/dash.all.min.js' })])
    .create()
</script>
```
