import { LibraryOptions } from 'vite'
import { viteConfig } from '../../vite.config'

export default viteConfig('ui', {
  build: {
    emptyOutDir: false,
    rollupOptions: {
      external: [],
      output: { dir: '../core/dist' }
    },
    lib: {
      entry: './src/index.core.ts',
      name: 'OPlayer',
      formats: ['umd'],
      fileName: () => 'index.ui.js'
    } as LibraryOptions
  }
})
