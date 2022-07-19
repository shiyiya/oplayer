import path from 'path'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

export const baseConfig = (packageDirName) => ({
  input: path.resolve(__dirname, `packages/${packageDirName}/src/index.ts`),
  output: [
    {
      file: path.resolve(__dirname, `packages/${packageDirName}/dist/index.min.js`),
      format: 'iife',
      strict: false,
      name: 'TEST'
    }
  ],
  plugins: [
    typescript({
      tsconfig: path.resolve(__dirname, `packages/${packageDirName}/tsconfig.json`)
    }),
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, `babel.config.js`)
    })
  ]
})

export default [baseConfig('core')]
