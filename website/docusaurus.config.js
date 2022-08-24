// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OPlayer',
  tagline: 'OPlayer are cool',
  url: 'https://oplayer.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'shiyiya', // Usually your GitHub org/user name.
  projectName: 'oplayer', // Usually your repo name.

  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en'],
  //   path: 'docs'
  //   localeConfigs: {
  //     en: {
  //       label: 'English'
  //     },
  //     'zh-CN': {
  //       label: '中文'
  //     }
  //   }
  // },
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light'
      },
      doc: {
        sidebar: {
          hideable: true
        }
      },
      // algolia: {
      //   apiKey: '',
      //   indexName: 'oplayer'
      // },
      navbar: {
        title: 'OPlayer',
        hideOnScroll: true,
        logo: {
          alt: 'OPlayer',
          src: 'img/logo.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'getting-started',
            label: 'Doc',
            position: 'left'
          },
          {
            type: 'doc',
            docId: 'api/config',
            label: 'API',
            position: 'left'
          },
          {
            href: 'https://github.com/shiyiya/oplayer/issues/new',
            label: 'Feedback',
            position: 'left'
          },
          {
            type: 'localeDropdown',
            position: 'right'
          }
        ]
      },
      footer: {
        logo: {
          alt: 'oplayer',
          src: 'img/logo.svg',
          href: 'https://github.com/shiyiya/oplayer'
        },
        style: 'dark',
        links: [
          {
            title: 'Doc',
            items: [
              {
                label: 'Getting started',
                to: 'docs/'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/oplayer'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/shiyiya/oplayer/issues'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/shiyiya/oplayer'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} <a target="_blank" rel="noopener noreferrer" href="https://github.com/shiyiya">shiyiya</a>`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    }),
  plugins: ['docusaurus-plugin-sass'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/shiyiya/oplayer/edit/main/website/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss')
        }
      }
    ]
  ]
}

module.exports = config
