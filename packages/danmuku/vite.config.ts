import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('danmuku', {
  build: {
    lib: { name: 'ODanmuku' } as LibraryOptions
  }
})
