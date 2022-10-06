import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('core', {
  build: {
    lib: { name: 'OPlayer', formats: ['es'] } as LibraryOptions
  }
})
