import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('ad', {
  build: {
    lib: { name: 'OAD' } as LibraryOptions
  }
})
