import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        nested: resolve(__dirname, 'ep.html')
      }
    }
  }
})
