import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  staticImage: true,
  flexsearch: {
    codeblocks: false
  }
})

export default withNextra({
  // reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    }
  }
})
