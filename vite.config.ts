import path from 'path'
import fs from 'fs'
import type { Plugin } from 'rollup'
import autoExternal from 'rollup-plugin-auto-external'
import type { BuildOptions, UserConfig as ViteUserConfig } from 'vite'
import { defineConfig } from 'vite'

export const libFileName = (format: string) => `index.${format}.js`

export const rollupPlugins: Plugin[] = [autoExternal()]

export const external = ['@oplayer/core', /lit.*/]

export const viteBuild = (packageDirName: string, options: BuildOptions = {}): BuildOptions =>
  mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      lib: {
        entry: resolvePath(`packages/${packageDirName}/src/index.ts`),
        name: `oplayer_${packageDirName}`,
        fileName: libFileName,
        formats: ['es']
      },
      rollupOptions: {
        external,
        output: {
          dir: resolvePath(`packages/${packageDirName}/dist`)
        },
        plugins: rollupPlugins
      }
    },
    options
  )

export const viteConfig = (packageDirName: string, options: ViteUserConfig = {}) => {
  const vitePlugins = options.plugins ?? []
  const version = JSON.parse(
    fs.readFileSync(resolvePath(`packages/${packageDirName}/package.json`), { encoding: 'utf-8' })
  ).version

  return defineConfig({
    ...options,
    build: viteBuild(packageDirName, options.build),
    plugins: [...vitePlugins, ...rollupPlugins],
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
