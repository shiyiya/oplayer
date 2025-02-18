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
  var player = OPlayer.make('#oplayer', {
    source: {
      src: 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd',
      poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
    }
  })
    .use([ODash({ library: 'https://cdn.dashjs.org/latest/dash.all.min.js' })])
    .create()
</script>
```

## DRM

```ts
// https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest_1080p.mpd
ODash({
  drm: {
    'com.widevine.alpha': {
      serverURL: 'https://drm-widevine-licensing.axtest.net/AcquireLicense',
      httpRequestHeaders: {
        'X-AxDRM-Message':
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiYjMzNjRlYjUtNTFmNi00YWUzLThjOTgtMzNjZWQ1ZTMxYzc4IiwibWVzc2FnZSI6eyJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImtleXMiOlt7ImlkIjoiOWViNDA1MGQtZTQ0Yi00ODAyLTkzMmUtMjdkNzUwODNlMjY2IiwiZW5jcnlwdGVkX2tleSI6ImxLM09qSExZVzI0Y3Iya3RSNzRmbnc9PSJ9XX19.4lWwW46k-oWcah8oN18LPj5OLS5ZU-_AQv7fe0JhNjA'
      },
      priority: 0
    }
  }
})

// update drm
player.context.dash.options.drm = {
  // ...
}
```
