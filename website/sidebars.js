module.exports = {
  docs: [
    'Introduction',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/Installation',
        'getting-started/Configuration',
        'getting-started/Plugin'
      ]
    },
    {
      link: {
        type: 'generated-index',
        title: 'Plugins',
        slug: '/Plugins'
      },
      type: 'category',
      label: 'Plugins',
      collapsed: false,
      items: [
        'plugins/ui',
        'plugins/hls',
        'plugins/dash',
        'plugins/torrent',
        'plugins/danmaku',
        'plugins/ad',
        'plugins/react'
      ]
    }
  ]
  // api: ['api/config', 'api/events', 'api/attrs', 'api/methods']
}
