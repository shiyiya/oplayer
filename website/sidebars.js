module.exports = {
  docs: [
    'introduction',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/configuration',
        'getting-started/plugin'
      ]
    },
    {
      link: {
        type: 'generated-index',
        title: 'Plugins',
        slug: '/plugins'
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
