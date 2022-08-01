import { ConfigEnv, defineConfig } from 'vite'

export default defineConfig((_: ConfigEnv) => ({
  // base: env.command == 'build' ? '/oplayer/' : '/',
  build: {
    assetsDir: 'assets',
    outDir: '../../docs',
    emptyOutDir: true
  }
}))
