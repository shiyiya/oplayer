import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('shaka', {
  build: {
    lib: { name: 'OShaka' } as LibraryOptions
  }
})
