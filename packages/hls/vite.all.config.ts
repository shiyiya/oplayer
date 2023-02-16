import { viteConfig } from '../../vite.config'

export default viteConfig('hls', {
  build: {
    emptyOutDir: false,
    rollupOptions: { external: ['@oplayer/core'] },
    lib: {
      name: 'OHls',
      fileName: () => 'index.hls.js',
      formats: ['umd']
    } as any
  }
})
