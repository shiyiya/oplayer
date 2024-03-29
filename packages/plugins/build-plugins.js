import fs from 'node:fs'
import path from 'node:path'
import { build } from 'vite'
import { globSync } from 'glob'
import chokidar from 'chokidar'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import banner from 'vite-plugin-banner'

const external = ['@oplayer/core', 'm3u8-parser']

const globals = {
  '@oplayer/core': 'OPlayer',
  'm3u8-parser': 'm3u8Parser'
}

async function buildPlugin(name, dev) {
  const { version, description, author, homepage } = JSON.parse(fs.readFileSync(`package.json`, 'utf-8'))
  const outfileName = name
  const pluginName = name == 'index' ? '@oplayer/plugins' : `@oplayer/${outfileName}`
  const now = Date.now()
  console.log(`👾 Start built ${pluginName} ··· `)

  // process.chdir('plugins')
  await build({
    build: {
      emptyOutDir: false,
      sourcemap: false,
      lib: {
        entry: plugins[name],
        formats: dev ? ['es'] : ['es', 'umd'],
        name: dev ? undefined : 'O' + outfileName.charAt(0).toUpperCase() + outfileName.slice(1),
        fileName: (format) => `${outfileName}.${{ es: 'es', umd: 'min' }[format]}.js`
      },
      rollupOptions: { external, output: { dir: 'dist', globals } }
    },
    plugins: [
      cssInjectedByJsPlugin(),
      banner(
        `/**\n * name: ${pluginName}\n * version: v${version}\n * description: ${description}\n * author: ${author}\n * homepage: ${homepage}\n */`
      )
    ],
    define: { __VERSION__: `'${version}'` }
  })

  console.log(`✨ Built ${name}@${version} - ${Date.now() - now}ms!`)
}

function runInQueue(ps) {
  return ps.reduce((p, next) => p.then(next), Promise.resolve())
}

const plugins = globSync('src/*.ts').reduce(
  (result, item) => {
    result[path.basename(item, path.extname(item))] = item
    return result
  },
  { index: 'index.ts' }
)

if (process.argv.pop() == '--watch') {
  await buildPlugin('index', true)

  const watcher = chokidar
    .watch('src', {
      ignored: /(^|[\/\\])\../,
      ignorePermissionErrors: true,
      disableGlobbing: true
    })
    .on('change', () => {
      buildPlugin('index', true)
    })

  async function close() {
    await watcher.close()
    process.exit(0)
  }

  process.on('SIGINT', close)
  process.on('SIGTERM', close)
} else {
  fs.rmSync('./dist', { recursive: true, force: true })

  const bundles = Object.keys(plugins).map((name) => () => buildPlugin(name))

  runInQueue(bundles).then(() => {
    console.log(`✨ Finished building all plugins!`)
  })

  // buildPlugin('index', true)
}
