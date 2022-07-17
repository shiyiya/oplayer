import { ConfigEnv, defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig((env: ConfigEnv) => ({
  base: env.command == 'build' ? '/oplayer/' : '/',
  build: {
    assetsDir: 'assets',
    outDir: '../../docs'
  },
  plugins: [
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }) as any
  ]
}))
