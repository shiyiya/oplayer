import { LibraryOptions } from 'vite'
import banner from 'vite-plugin-banner'
import { viteConfig } from '../../vite.config'
import { version as CoreVersion, name as CoreName, author, description, homepage } from '../core/package.json'
import { version as UIVersion, name as UIName } from '../ui/package.json'

export default viteConfig(
  'ui',
  {
    build: {
      emptyOutDir: false,
      rollupOptions: {
        external: [],
        output: { dir: '../core/dist' }
      },
      lib: {
        entry: './src/index.core.ts',
        name: 'OPlayer',
        formats: ['umd'],
        fileName: () => 'index.ui.js'
      } as LibraryOptions
    },
    plugins: [
      banner({
        outDir: '../core/dist',
        content: `/**\n * name: ${CoreName} + ${UIName}\n * version: v${CoreVersion} + v${UIVersion}\n * description: ${description}\n * author: ${author}\n * homepage: ${homepage}\n */`
      })
    ]
  },
  false
)
