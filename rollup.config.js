import path from 'path'
import fs from 'fs'
import babel from '@rollup/plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { globals } from './config'
import commonjs from '@rollup/plugin-commonjs'
import { DEFAULT_EXTENSIONS } from '@babel/core'

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return (id) => pattern.test(id)
}

const resolveConfig = (packageDirName) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `packages/${packageDirName}/package.json`), {
      encoding: 'utf-8'
    })
  )
  return {
    input: path.resolve(
      __dirname,
      `packages/${packageDirName}/src/index${packageDirName === 'core' ? '.umd' : ''}.ts`
    ),
    output: [
      {
        file: path.resolve(__dirname, `packages/${packageDirName}/dist/index.min.js`),
        format: 'umd',
        sourcemap: true,
        strict: false,
        name: globals[`@oplayer/${packageDirName}`],
        globals
      }
    ],
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({ extensions: [...DEFAULT_EXTENSIONS, '.ts'] }),
      typescript({
        tsconfig: path.resolve(__dirname, `packages/${packageDirName}/tsconfig.json`)
      }),
      babel({
        comments: false,
        minified: true,
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        configFile: path.resolve(__dirname, `babel.config.js`)
      }),
      commonjs()
    ]
  }
}

export default [
  resolveConfig('core'),
  resolveConfig('ui'),
  resolveConfig('hls'),
  resolveConfig('torrent')
]
