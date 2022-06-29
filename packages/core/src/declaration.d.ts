declare const __VERSION__: string

declare module 'hls.js/dist/hls.light.min' {
  import Hls from 'hls.js'
  export = Hls
}

declare module 'webtorrent/webtorrent.min' {
  const Any: any
  export = Any
}
