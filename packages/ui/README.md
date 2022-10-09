# oplayer-theme-snow

ui plugin for oplayer

## Usage

```ts
OUI({
  autoFocus: true,
  screenshot: true,
  theme: { primaryColor: '#f00' },
  subtitle: {
    color: 'hotpink',
    fontSize: isMobile ? 16 : 20,
    source: [
      {
        name: 'Default',
        default: true,
        src: 'https://oplayer.vercel.app/君の名は.srt'
      }
    ]
  },
  thumbnails: {
    src: 'https://oplayer.vercel.app/thumbnails.jpg',
    number: 100
  },
  highlight: [
    {
      time: 12,
      text: '谁でもいいはずなのに'
    },
    {
      time: 34,
      text: '夏の想い出がまわる'
    },
    {
      time: 58,
      text: 'こんなとこにあるはずもないのに'
    },
    {
      time: 88,
      text: '－－终わり－－'
    }
  ],
  menu: [
    {
      name: 'source',
      children: [
        {
          name: 'mp4',
          default: true,
          value: 'https://oplayer.vercel.app/君の名は.mp4'
        },
        {
          name: 'hls',
          value: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        },
        {
          name: 'dash',
          value: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd'
        }
      ],
      onChange({ value }) {
        player.changeSource({ src: value })
      }
    }
  ]
})
```

## Icon

- [Boy\_\_Yan](https://www.iconfont.cn/collections/detail?cid=40262)
- [1214monkey](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=12086)
- [loop](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=15901)
- [quality](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=13520)
- [speed](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.0.da5a778a4&cid=39216)
