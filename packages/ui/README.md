# oplayer-theme-snow

ui plugin for oplayer

## Usage

```ts
OUI({
  autoFocus: true,
  screenshot: true,
  fullscreen: true,
  coverButton: true,
  miniProgressBar: true,
  pictureInPicture: true,
  keyboard: { focused: true },
  theme: { primaryColor: '#f00' },
  speed: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'],
  settings: ['loop'],
  subtitle: {
    color: 'hotpink',
    fontSize: isMobile ? 16 : 20,
    source: [
      {
        name: 'Japanese',
        default: true,
        src: 'https://oplayer.vercel.app/君の名は.srt'
      },
      {
        name: 'English',
        default: false,
        src: 'https://oplayer.vercel.app/君の名は.srt'
      }
    ]
  },
  thumbnails: { src: 'https://oplayer.vercel.app/thumbnails.jpg', number: 100 },
  highlight: [
    { time: 12, text: '谁でもいいはずなのに' },
    { time: 34, text: '夏の想い出がまわる' },
    { time: 58, text: 'こんなとこにあるはずもないのに' },
    { time: 88, text: '－－终わり－－' }
  ],
  menu: [
    {
      name: 'Quality(清晰度)',
      children: [
        {
          name: 'FHD',
          default: true,
          value: 'https://oplayer.vercel.app/君の名は.mp4'
        },
        {
          name: 'HD',
          value: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        },
        {
          name: 'SD',
          value: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd'
        }
      ],
      onChange({ value }) {
        player.changeQuality({ src: value })
      }
    }
  ]
})
```
