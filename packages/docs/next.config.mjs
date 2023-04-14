import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  staticImage: true,
  flexsearch: {
    codeblocks: true
  }
})

export default withNextra({
  // reactStrictMode: true,
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    }
    // https://github.com/vercel/next.js/issues/33693
    config.infrastructureLogging = {
      level: 'error'
    }
    return config
  }
})
