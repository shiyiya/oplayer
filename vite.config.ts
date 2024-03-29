import fs from 'fs'
import path from 'path'
import type { BuildOptions, UserConfig as ViteUserConfig, UserConfigExport } from 'vite'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'

export const globals = {
  '@oplayer/core': 'OPlayer',
  '@oplayer/ui': 'OUI',
  '@oplayer/hls': 'OHls',
  '@oplayer/mpegts': 'OMpegts',
  '@oplayer/torrent': 'OTorrent',
  '@oplayer/danmaku': 'ODanmaku',
  react: 'React',
  // 'react/jsx-runtime':'',
  dashjs: 'dashjs',
  'hls.js': 'Hls',
  'hls.js/dist/hls.min.js': 'Hls',
  'mpegts.js/dist/mpegts.js': 'mpegts',
  'webtorrent/dist/webtorrent.min.js': 'WebTorrent',
  'webtorrent/webtorrent.min.js': 'WebTorrent'
}

const babelPlugins = [
  'syntax-trailing-function-commas',
  // x ??= 1
  // '@babel/plugin-proposal-logical-assignment-operators',
  '@babel/plugin-transform-logical-assignment-operators',
  // x ?? 1
  // '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-transform-nullish-coalescing-operator',
  // These use loose mode which avoids embedding a runtime.
  // TODO: Remove object spread from the source. Prefer Object.assign instead.
  // ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
  ['@babel/plugin-transform-object-rest-spread', { loose: true, useBuiltIns: true }],
  ['@babel/plugin-transform-template-literals', { loose: true }],
  // TODO: Remove array spread from the source. Prefer .apply instead.
  ['@babel/plugin-transform-spread', { loose: true, useBuiltIns: true }],
  '@babel/plugin-transform-parameters',
  // TODO: Remove array destructuring from the source. Requires runtime.
  ['@babel/plugin-transform-destructuring', { loose: true, useBuiltIns: true }]
]

const makeExternalPredicate = (externalArr: string[]) => {
  if (externalArr.length === 0) return () => false
  return (id: string) => new RegExp(`^(${externalArr.join('|')})($|/)`).test(id)
}

export const libFileName = (format: string) => `index.${{ es: 'es', umd: 'min' }[format]}.js`

function getBabelConfig() {
  return {
    allowAllFormats: true,
    babelrc: false,
    configFile: false,
    presets: [],
    plugins: [...babelPlugins]
  }
}

export const rollupPlugins: any[] = [getBabelOutputPlugin(getBabelConfig())]

export const viteBuild = (packageDirName: string, options: BuildOptions = {}): BuildOptions => {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `packages/${packageDirName}/package.json`), {
      encoding: 'utf-8'
    })
  )
  return mergeDeep<BuildOptions>(
    {
      minify: 'terser',
      sourcemap: false,
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
          // ...Object.keys(pkg.dependencies || {}),
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

export const viteConfig = (
  packageDirName: string,
  options: ViteUserConfig = {},
  withBanner: boolean = true
) => {
  const vitePlugins = options.plugins ?? []
  const { name, version, description, author, homepage } = JSON.parse(
    fs.readFileSync(resolvePath(`packages/${packageDirName}/package.json`), { encoding: 'utf-8' })
  )
  const defaultPlugins = withBanner
    ? [
        banner(
          `/**\n * name: ${name}\n * version: v${version}\n * description: ${description}\n * author: ${author}\n * homepage: ${homepage}\n */`
        )
      ]
    : []
  return defineConfig({
    ...options,
    build: viteBuild(packageDirName, options.build),
    plugins: [...vitePlugins, ...rollupPlugins, ...defaultPlugins] as any,
    define: { __VERSION__: `'${version}'` }
  })
}

export default defineConfig({
  test: {
    include: ['test/*', 'packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'jsdom',
    minThreads: 0,
    maxThreads: 1
  }
} as UserConfigExport)

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
