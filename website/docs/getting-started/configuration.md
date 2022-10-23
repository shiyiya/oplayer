---
title: Configuration
---

:::tip
oplayer 大部分功能都通过插件的方式实现，点击查看 [插件列表](./plugin)。

是的，默认 `@oplayer/core` 也不提供用户界面 UI，可安装 [@oplayer/ui](../plugins/ui) 插件，该插件提供了一套基础 UI。
:::

```ts
Player.make(document.body, {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }，
  // 主要配置... 下面的配置放在此处
}).create()
```

```ts
export type PlayerOptions = {
  source: {
    poster?: string //视频封面地址
    src: string //视频播放地址
  }
  autoplay?: boolean // 是否自动播放，关于 autoplay 属性设置问题请参考
  muted?: boolean //是否静音
  loop?: boolean // 是否循环播放
  volume?: number // 初始化设置视频音量，取值 0 - 1
  preload?: 'auto' | 'metadata' | 'none' // 视频是否预加载
  playbackRate?: number //播放速度
  playsinline?: boolean // ??
  videoAttr?: Record<string, boolean | string> //其他属性 附加到 video 标签上
  lang?: Lang // 国际化， 默认用户浏览器首选语言
  evil?: () => boolean // 被浏览器拦截？
}
```
