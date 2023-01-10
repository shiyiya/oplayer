import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'script.html'),
        nested: resolve(__dirname, 'ep.html')
      }
    }
  }
})
