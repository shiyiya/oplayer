import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        shaka: resolve(__dirname, 'src/shaka-live.html')
      }
    }
  }
})
