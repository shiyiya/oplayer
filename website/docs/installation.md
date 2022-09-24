---
title: Installation
---

## 安装

### 使用 npm 安装：

npm i @oplayer/core @oplayer/ui

### 使用 yarn 安装：

yarn add @oplayer/core @oplayer/ui

## 使用

### ES 模块：

```ts
import Player from '@oplayer/core'
import ui from '@oplayer/ui'

Player.make(document.body, {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
}).create()
```

### `<script>` 标签：

```HTML

<script type="text/javascript" src="js/oplayer.min.js"></script>
<script type="text/javascript" src="js/oplayer.ui.min.js"></script>

<div id="oplayer"></div>

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  }).create()
</script>
```

就这么简单，enjoy it!
