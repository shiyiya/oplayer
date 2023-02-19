import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('ui', {
  build: {
    emptyOutDir: false,
    rollupOptions: { external: [] },
    lib: {
      entry: './src/index.core.ts',
      name: 'OPlayer',
      formats: ['umd'],
      fileName: () => 'index.core.js'
    } as LibraryOptions
  }
})
