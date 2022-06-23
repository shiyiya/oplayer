declare module '*.css'
declare module '*.css?raw'
declare const __VERSION__: string
declare module 'hls.js/dist/hls.light.min' {
  import Hls from 'hls.js'
  export = Hls
}
