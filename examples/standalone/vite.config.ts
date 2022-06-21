import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsDir: 'assets',
    outDir: '../../docs',
    emptyOutDir: true
  }
})
