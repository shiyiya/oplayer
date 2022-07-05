import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('torrent', {
  build: {
    lib: {
      name: 'OTorrent',
      formats: ['umd', 'es']
    } as LibraryOptions
  }
})
