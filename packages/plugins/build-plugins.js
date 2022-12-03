import fs from 'fs'
import path from 'path'
import { build } from 'vite'
import glob from 'glob'
import chokidar from 'chokidar'

const external = ['@oplayer/core']

async function buildPlugin(name) {
  const { version } = JSON.parse(fs.readFileSync(`package.json`, 'utf-8'))
  const pluginName = name.split('.').shift()
  const now = Date.now()
  console.log(`👾 Start built ${pluginName} ··· `)

  // process.chdir('plugins')
  await build({
    build: {
      emptyOutDir: false,
      sourcemap: true,
      lib: {
        entry: plugins[name],
        formats: ['es', 'umd'],
        name: 'O' + pluginName.charAt(0).toUpperCase() + pluginName.slice(1),
        fileName: (format) => `${pluginName}.${{ es: 'es', umd: 'min' }[format]}.js`
      },
      rollupOptions: {
        external: external,
        output: {
          dir: 'dist',
          globals: {}
        }
      }
    }
  })

  console.log(`✨ Built ${name}@${version} - ${Date.now() - now}ms!`)
}

function runInQueue(ps) {
  return ps.reduce((p, next) => p.then(next), Promise.resolve())
}

const plugins = glob.sync(path.join(process.cwd(), 'plugins/*')).reduce((result, item) => {
  const name = item.split('/').pop()
  // @ts-ignore
  result[name] = item
  return result
}, {})

const bundles = Object.keys(plugins).map((name) => () => buildPlugin(name))

runInQueue(bundles).then(() => {
  console.log(`✨ Finished building all plugins!`)
})

if (process.argv.pop() == '--watch') {
  chokidar
    .watch('plugins', {
      ignored: /(^|[\/\\])\../,
      ignorePermissionErrors: true,
      disableGlobbing: true
    })
    .on('change', (file) => {
      const fileName = file.split('plugins/').pop()
      buildPlugin(fileName)
    })
}
