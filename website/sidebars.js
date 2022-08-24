module.exports = {
  docs: [
    'installation',
    'getting-started',
    'shortcut',
    'settings',
    'thumbnail',
    'plugin',
    'streaming',
    {
      type: 'category',
      label: 'Ecosystem',
      collapsed: false,
      items: ['ecosystem/ui', 'ecosystem/hls', 'ecosystem/danmaku', 'ecosystem/react']
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: false,
      items: ['examples/custom-videoloader']
    }
  ],
  api: ['api/config', 'api/events', 'api/attrs', 'api/methods']
}
