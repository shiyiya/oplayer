---
title: 参数
---

## 主要配置

```ts
Player.make(document.body, {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
  // 主要配置...
}).create()
```

```ts
export type PlayerOptions = {
  autoplay?: boolean // 是否自动播放，关于 autoplay 属性设置问题请参考
  muted?: boolean //是否静音
  loop?: boolean // 是否循环播放
  volume?: number // 初始化设置视频音量，取值 0 - 1
  preload?: 'auto' | 'metadata' | 'none' // 视频是否预加载
  playbackRate?: number //播放速度
  playsinline?: boolean // ??
  source: {
    poster?: string //视频封面地址
    src: string //视频播放地址
  }
  videoAttr?: Record<string, boolean | string> //其他属性 附加到 video 标签上
  lang?: Lang // 国际化， 默认用户浏览器首选语言
  evil?: () => boolean // 被浏览器拦截？
}
```

## 主题配置

```ts
export type UiConfig = {
  theme?: {
    primaryColor: `#${string}`
  }
  /**
   * default: false
   * 是否自动获取焦点 当焦点在播放器是可以使用快捷键
   */
  autoFocus?: boolean
  /**
   * default: true
   * 是否使用快捷键
   */
  hotkey?: boolean
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
   * 字幕功能
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

  settings?: Setting[]

  thumbnails?: Thumbnails

  highlight?: Highlight[]

  /*  --- WIP ---  */

  contextmenu?: []

  airplay?: boolean
}
```
