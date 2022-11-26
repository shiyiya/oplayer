import { ConfigEnv, defineConfig } from 'vite'

export default defineConfig((_: ConfigEnv) => ({
  assetsInclude: ['**/*.srt', '**/*.xml', '**/*.flv'],
  build: {
    assetsDir: 'assets',
    outDir: '../../docs',
    emptyOutDir: true
  }
}))
