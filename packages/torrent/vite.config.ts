import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('torrent', {
  build: {
    lib: { name: 'OTorrent' } as LibraryOptions
  }
})
