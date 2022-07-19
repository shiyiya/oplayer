import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core'

import pkg from './package.json'

const isProd = process.env.NODE_ENV === 'production'
const isTesting = process.env.NODE_ENV === 'testing'
const processEnv = isProd || isTesting ? 'production' : 'development'

export const baseConfig = ({
  mainFile = pkg.main,
  moduleFile = pkg.module,
  injectCSS = true
} = {}) => ({
  input: 'src/index.ts',
  external: ['react', 'react-dom', (id) => id.includes('@babel/runtime')],
  onwarn(warning, rollupWarn) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      rollupWarn(warning)
    }
  },
  output: [
    {
      file: mainFile,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: moduleFile,
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    replace({}),
    resolve(),
    typescript({
      clean: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      extensions: [...DEFAULT_BABEL_EXTENSIONS, '.ts', '.tsx'],
      exclude: /^(.+\/)?node_modules\/.+$/,
      babelHelpers: 'runtime'
    })
  ]
})

export default isProd && !isTesting
  ? [
      baseConfig(),
      baseConfig({
        mainFile: 'dist/min.js',
        moduleFile: 'dist/es.js',
        injectCSS: false
      })
    ]
  : baseConfig()
