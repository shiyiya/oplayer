import path from 'path'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { external, globals } from './config'

const resolveConfig = (packageDirName) => ({
  input: path.resolve(__dirname, `packages/${packageDirName}/src/index.ts`),
  output: [
    {
      file: path.resolve(__dirname, `packages/${packageDirName}/dist/index.min.js`),
      format: 'iife',
      strict: false,
      name: globals[`@oplayer/${packageDirName}`],
      globals
    }
  ],
  external,
  plugins: [
    typescript({
      tsconfig: path.resolve(__dirname, `packages/${packageDirName}/tsconfig.json`)
    }),
    nodeResolve({ browser: true }),
    commonjs({ sourceMap: false }),
    babel({
      comments: false,
      minified: true,
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, `babel.config.js`)
    })
  ]
})

export default [
  resolveConfig('core'),
  resolveConfig('ui'),
  resolveConfig('hls'),
  resolveConfig('torrent')
]
