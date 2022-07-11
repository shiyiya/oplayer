import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('ui', {
  build: {
    lib: { name: 'OUI' } as LibraryOptions
  }
})
