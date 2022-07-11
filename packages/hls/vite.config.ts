import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('hls', {
  build: {
    lib: { name: 'OHls' } as LibraryOptions
  }
})
