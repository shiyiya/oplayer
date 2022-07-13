import { ConfigEnv, defineConfig } from 'vite'

export default defineConfig((env: ConfigEnv) => ({
  base: env.command == 'build' ? '/oplayer/' : '/',
  build: {
    assetsDir: 'assets',
    outDir: '../../docs',
  }
}))
