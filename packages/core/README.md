# OPlayer Core

[![npm](https://img.shields.io/npm/v/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@oplayer/core?style=flat-square&label=core)
[![npm dm](https://img.shields.io/npm/dm/@oplayer/core?style=flat-square)](https://www.npmjs.com/package/@oplayer/core)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/@oplayer/core/badge)](https://www.jsdelivr.com/package/npm/@oplayer/core)

![](../../oplayer.png)

## Basic

```js
const player = OPlayer.make('#player', {
  source: {
    title: '君の名は',
    src: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/君の名は.mp4',
    poster: 'https://cdn.jsdelivr.net/gh/shiyiya/QI-ABSL@master/o/poster.png'
  }
})
  .use([OUI()])
  .create()
```
