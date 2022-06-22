import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('core', {
  build: {
    emptyOutDir: false,
    lib: {
      name: 'Player',
      formats: ['umd', 'es']
    } as LibraryOptions
  }
})
