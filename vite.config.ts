import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import type { Plugin } from 'rollup'
import type { BuildOptions, UserConfig as ViteUserConfig } from 'vite'

export const globals = {
  '@oplayer/core': 'OPlayer',
  '@oplayer/ui': 'OUI',
  '@oplayer/hls': 'OHls',
  'hls.js/dist/hls.light.min.js': 'Hls',
  '@oplayer/torrent': 'OTorrent',
  'webtorrent/webtorrent.min.js': 'WebTorrent',
  '@oplayer/danmaku': 'ODanmaku',
  react: 'React'
}

const makeExternalPredicate = (externalArr: string[]) => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return (id: string) => pattern.test(id)
}

export const libFileName = (format: string) => `index.${format}.js`

export const rollupPlugins: Plugin[] = []

export const viteBuild = (packageDirName: string, options: BuildOptions = {}): BuildOptions => {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `packages/${packageDirName}/package.json`), {
      encoding: 'utf-8'
    })
  )
  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      commonjsOptions: {
        sourceMap: false
      },
      lib: {
        entry: resolvePath(`packages/${packageDirName}/src/index.ts`),
        name: `oplayer_${packageDirName}`,
        fileName: libFileName,
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: makeExternalPredicate([
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {})
        ]),
        output: {
          dir: resolvePath(`packages/${packageDirName}/dist`),
          globals
        },
        plugins: rollupPlugins as any
      }
    },
    options
  )
}

export const viteConfig = (packageDirName: string, options: ViteUserConfig = {}) => {
  const vitePlugins = options.plugins ?? []
  const version = JSON.parse(
    fs.readFileSync(resolvePath(`packages/${packageDirName}/package.json`), { encoding: 'utf-8' })
  ).version

  return defineConfig({
    ...options,
    build: viteBuild(packageDirName, options.build),
    plugins: [...vitePlugins, ...rollupPlugins] as any,
    define: {
      __VERSION__: `'${version}'`
    }
  })
}

export default defineConfig({})

const resolvePath = (str: string) => path.resolve(__dirname, str)

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item))
}

function mergeDeep<T>(target: T, ...sources: T[]): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key] as T, source[key] as T)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
