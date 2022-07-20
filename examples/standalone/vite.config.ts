import { ConfigEnv, defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig((env: ConfigEnv) => ({
  base: env.command == 'build' ? '/oplayer/' : '/',
  build: {
    assetsDir: 'assets',
    outDir: '../../docs',
    emptyOutDir: true
  },
  plugins: [
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
}))
