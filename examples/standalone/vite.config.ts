import { ConfigEnv, defineConfig } from 'vite'

export default defineConfig((_: ConfigEnv) => ({
  assetsInclude: ['**/*.srt', '**/*.xml', '**/*.flv'],
  // build: {
  //   rollupOptions: {
  //     external: [
  //       'webtorrent/webtorrent.min.js',
  //       'hls.js/dist/hls.min.js',
  //       'mpegts.js/dist/mpegts.js',
  //       'shaka-player/dist/shaka-player.compiled',
  //       'dashjs'
  //     ]
  //   }
  // },
  plugins: [
    {
      name: 'ignore-external-in-dev-runtime',
      resolveId(source) {
        if (source == 'webtorrent/webtorrent.min.js') {
          // return 'ignore-external-in-dev-runtime'
          return { id: 'ignore-external-in-dev-runtime' }
        }

        return null
      },
      load(id) {
        if (id == 'ignore-external-in-dev-runtime') {
          return 'export default function G(){ throw Error("oh~~~~ webtorrent not found!") }'
        }
        return null
      }
    }
  ]
}))
