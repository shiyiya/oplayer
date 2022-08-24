import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('danmaku', {
  build: {
    lib: { name: 'ODanmaku' } as LibraryOptions
  }
})
