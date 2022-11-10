import react from '@vitejs/plugin-react'
import { viteConfig } from '../../vite.config'

export default viteConfig('react', {
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx'
    }
  }
})
