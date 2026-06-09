import nextra from 'nextra'

const basePath = process.env.DOCS_BASE_PATH || ''

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  staticImage: true,
  flexsearch: {
    codeblocks: true
  },
  defaultShowCopyCode: true
})

export default withNextra({
  output: 'export',
  reactStrictMode: false,
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    }
    config.infrastructureLogging = {
      level: 'error'
    }
    return config
  }
})
