# oplayer-theme-snow

Offical ui for oplayer

## Usage

```tsx
// type def
const defaultConfig: SnowConfig = {
  theme: {
    primaryColor: '#6668ab'
  },
  speed: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5'],
  disableFullscreen: false,
  disablePictureInPicture: false
}

export type SnowConfig = {
  theme?: {
    primaryColor: `#${string}`
  }
  speed?: string[]
  disableFullscreen?: boolean
  disablePictureInPicture?: boolean
}

import ui from '@oplayer/ui'

const options: SnowConfig = {
  theme:{
    primaryColor: '#red',
  },
  speed: [], // disable speed switcher
}

Player.make(...).use([ui(options)]).create()
```
