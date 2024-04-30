import path = require('path')
import { ConfigEnv, defineConfig } from 'vite'
import fs = require('fs')
var url = require('url')

const wasmMiddleware = () => {
  return {
    name: 'wasm-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith('.wasm')) {
          const wasmPath = path.join(
            __dirname,
            '../../packages/mkv/w/' + path.basename(url.parse(req.url).pathname)
          )

          const wasmFile = fs.readFileSync(wasmPath)
          res.setHeader('Content-Type', 'application/wasm')
          res.end(wasmFile)
          return
        }
        next()
      })
    }
  }
}
export default defineConfig((_: ConfigEnv) => ({
  assetsInclude: ['**/*.srt', '**/*.xml', '**/*.flv', '**/*.mkv'],
  plugins: [wasmMiddleware()]
}))
