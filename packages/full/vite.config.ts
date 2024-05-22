import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('full', {
  build: {
    emptyOutDir: false,
    lib: {
      name: 'OPlayer',
      formats: ['umd']
    } as LibraryOptions
  }
})
