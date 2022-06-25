import { ConfigEnv, defineConfig } from 'vite'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig((env: ConfigEnv) => ({
  base: env.command == 'build' ? '/oplayer/' : '/',
  build: {
    assetsDir: 'assets',
    outDir: '../../docs',
    emptyOutDir: true
  },
  plugins: [viteCommonjs()]
}))
