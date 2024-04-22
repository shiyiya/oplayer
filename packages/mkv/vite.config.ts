import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('mkv', {
  build: {
    lib: { name: 'OMkv' } as LibraryOptions
  }
})
