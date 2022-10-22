---
title: Installation
---

```bash npm2yarn
npm install --save @oplayer/core @oplayer/ui
```

## 使用

import CodeBlock from '../../src/components/CodeBlock'

<Tabs>
<TabItem value="js" label="npm">

```js
import Player from '@oplayer/core'
import ui from '@oplayer/ui'

Player.make(document.getElementById('oplayer'), {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([ui()])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.umd.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([OUI()])
    .create()
</script>
```

</TabItem>

</Tabs>

就这么简单，enjoy it!
