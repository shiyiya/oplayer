import fs from 'fs'
import path from 'path'
import { build } from 'vite'
import glob from 'glob'
import chokidar from 'chokidar'

const external = ['@oplayer/core']

const globals = {
  '@oplayer/core': 'OPlayer'
}

async function buildPlugin(name, dev) {
  const { version } = JSON.parse(fs.readFileSync(`package.json`, 'utf-8'))
  const pluginName = name.split('.').shift()
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
        name: dev ? undefined : 'O' + pluginName.charAt(0).toUpperCase() + pluginName.slice(1),
        fileName: (format) => `${pluginName}.${{ es: 'es', umd: 'min' }[format]}.js`
      },
      rollupOptions: { external, output: { dir: 'dist', globals } }
    }
  })

  console.log(`✨ Built ${name}@${version} - ${Date.now() - now}ms!`)
}

function runInQueue(ps) {
  return ps.reduce((p, next) => p.then(next), Promise.resolve())
}

const plugins = glob.sync('src/*').reduce(
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
  const bundles = Object.keys(plugins).map((name) => () => buildPlugin(name))

  runInQueue(bundles).then(() => {
    console.log(`✨ Finished building all plugins!`)
  })

  buildPlugin('index', true)
}
