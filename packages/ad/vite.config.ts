import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('dash', {
  build: {
    lib: { name: 'OAD' } as LibraryOptions
  }
})
