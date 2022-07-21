module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', '> 1%', 'not dead', 'ie >= 11']
        },
        spec: true,
        modules: 'auto',
        useBuiltIns: 'usage',
        forceAllTransforms: true,
        loose: true,
        corejs: {
          version: 3,
          proposals: false
        }
      }
    ]
  ],
  plugins: ['@babel/plugin-transform-runtime']
}
