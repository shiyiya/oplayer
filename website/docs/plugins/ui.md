---
title: oplayer-plugin-ui
description: ''
---

```bash npm2yarn
npm install --save @oplayer/ui
```

More Info: https://github.com/shiyiya/oplayer/tree/main/packages/torrent

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
  .use([
    ui({
      theme: {
        primaryColor: 'red'
        // 其他设置
      }
    })
  ])
  .create()
```

</TabItem>
<TabItem value="html" label="script">

```html
<script src="https://cdn.jsdelivr.net/npm/@oplayer/core@latest/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oplayer/ui@latest/dist/index.min.js"></script>

<div id="oplayer" />

<script>
  OPlayer.make(document.getElementById('oplayer'), {
    source: {
      src: 'https://oplayer.vercel.app/君の名は.mp4',
      poster: 'https://oplayer.vercel.app/poster.png'
    }
  })
    .use([
      OUI({
        theme: {
          primaryColor: 'red'
          // 其他设置
        }
      })
    ])
    .create()
</script>
```

</TabItem>

</Tabs>

## 配置

```ts
export type UiConfig = {
  theme?: {
    primaryColor: string
  }
  /**
   * default: false
   * 是否自动获取焦点 当焦点在播放器是可以使用快捷键
   */
  autoFocus?: boolean
  /**
   * default: true 手机：无
   * 是否使用快捷键
   *  ↑ ↓ 音量 +-10%
   *  ← → 进度条 +-5s
   *  空格 播放暂停
   */
  keyboard?: { focused?: boolean; global?: boolean }
  /**
   * default: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5']
   * 指定倍速列表
   */
  speed?: string[]
  /**
   * default: false
   * 是否开启截图功能
   */
  screenshot?: boolean
  /**
   * default: true
   * 是否开启全屏功能
   */
  fullscreen?: boolean
  /**
   * default: true
   * 是否开启 PIP 功能
   */
  pictureInPicture?: boolean
  /**
   * default: true
   * 隐藏控制界面是是否显示进度条指示器
   */
  miniProgressBar?: boolean

  /**
   * 外挂字幕
   *
   */
  subtitle?: {
    source: [
      //数组 支持多条字幕
      {
        default?: boolean // 默认字幕
        name?: string //字幕名称
        src: string // 字幕地址
        encoding?: string // 字幕格式 一般不填
        type?: string // 一般不填
      }
    ]

    fontSize?: number //字幕字体大小
    enabled?: boolean //是否默认显示
    bottom?: string //距离底部距离
    color?: string //字幕颜色
  }

  /**
   * 设置按钮
   */
  settings?: {
    name: string
    key?: string
    type: 'selector' | 'switcher'
    icon?: string
    children?: Setting[]
    onChange?: (a: T, b?: { index: number }) => void | Promise<void>
    default?: any
    value?: T
  }[]

  /**
   * - https://archive.org/download/zeranoe/win64/static/
   *- https://github.com/shiyiya/oplayer/packages/thumbnails-tool
   *
   *
   *$ npm i -g @oplayer/thumbnails-tool
   *$ oplayer-thumbnails --help
   *$ oplayer-thumbnails -o ./thumbnails.jpg -q 60 demo.mp4 -c 100
   */

  thumbnails?: {
    src: string
    number: number
    width?: number
    height?: number
    isVTT?: boolean
  }

  highlight?: {
    text: string
    time: number
  }[]

  icons?: {
    play: string
    pause: string
    volume: [string, string] //on off
    fullscreen: [string, string]
    pip: string
    setting: string
    screenshot: string
    playbackRate: string
    loop: string
    progressIndicator: string
    loadingIndicator: string
  }
}
```

## 新增事件

```ts

```
