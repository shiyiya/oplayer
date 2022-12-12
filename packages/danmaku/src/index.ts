import { $, isIOS, Player, PlayerPlugin } from '@oplayer/core'
import Danmaku from 'danmaku'
import { danmakuParseFromUrl } from './danmaku-parse'
import type { Comment, Options } from './types'

//@ts-ignore
import danmakuSvg from './danmaku.svg?raw'

export * from './types'

export default (options = {} as Options): PlayerPlugin => ({
  key: 'danmaku',
  name: 'oplayer-plugin-danmaku',
  apply: (player: Player) => {
    if (player.isNativeUI) return

    const { speed, opacity, engine } = options
    const $danmaku = $.render($.create('div'), player.$root)
    $danmaku.style.cssText = `position: absolute;left: 0;top: 0;right: 0;bottom: 0;width: 100%;height: 100%;overflow: hidden;pointer-events: none;`
    if (opacity) $danmaku.style.opacity = `${opacity}`
    if (options.enable == undefined) options.enable = true

    const danmaku = new Danmaku({
      container: $danmaku,
      media: player.$video,
      engine: engine || 'dom',
      comments: []
    })
    if (speed) danmaku.speed = speed

    player.on('fullscreenchange', () => {
      if (!isIOS) danmaku.resize()
    })

    player.on('videosourcechange', () => {
      danmaku.clear()
      // @ts-ignore
      danmaku.comments = []
    })

    const resize = danmaku.resize.bind(danmaku)
    window.addEventListener('resize', resize)
    player.on('destroy', () => {
      danmaku.destroy()
      window.removeEventListener('resize', resize)
    })

    bootstrap(options.source).then(() => {
      registerSetting()
      if (!options.enable) danmaku.hide()
    })

    async function fetch(source: any) {
      try {
        let danmakus: Comment[]
        if (typeof source === 'function') {
          danmakus = await source()
        } else if (typeof source === 'string') {
          danmakus = (await danmakuParseFromUrl(source)) as any
        } else {
          danmakus = source
        }
        return danmakus || []
      } catch (error) {
        player.emit('notice', { text: 'danmaku: ' + (<Error>error).message })
        throw error
      }
    }

    function bootstrap(source: any) {
      return fetch(source).then((res) => {
        danmaku.clear()
        // @ts-ignore
        console.log(res.length)

        danmaku.comments = res.sort((a, b) => a.time - b.time)
        // console.log(danmaku.comments)

        if (options.fontSize) setFontSize(options.fontSize)
      })
    }

    function setFontSize(value: number) {
      // @ts-ignore
      danmaku.comments.forEach((comment: any) => {
        if (comment.style?.fontSize) {
          comment.style.fontSize *= value
        }
      })
    }

    function registerSetting() {
      player.plugins.ui?.setting.register({
        name: player.locales.get('Danmaku'),
        type: 'selector',
        default: true,
        key: 'danmaku',
        icon: danmakuSvg,
        children: [
          {
            name: player.locales.get('Display'),
            type: 'switcher',
            default: options.enable ?? true,
            key: 'danmaku-switcher',
            onChange: (value: boolean) => {
              options.enable = value
              if (value) {
                danmaku.show()
              } else {
                danmaku.hide()
              }
            }
          },
          {
            type: 'selector',
            key: 'danmaku-font',
            name: player.locales.get('FontSize'),
            children: [0.5, 0.75, 1, 1.25].map((it) => ({
              name: `${it * 100}%`,
              value: it,
              default: it == 1
            })),
            onChange: ({ value }: any) => {
              options.fontSize = value
              setFontSize(value)
            }
          },

          {
            type: 'selector',
            key: 'danmaku-opacity',
            name: player.locales.get('Opacity'),
            children: [0.3, 0.5, 0.8, 1].map((it) => ({
              name: `${it * 100}%`,
              value: it,
              default: it == (options?.opacity || 1)
            })),
            onChange: ({ value }: any) => {
              $danmaku.style.opacity = value
            }
          },
          {
            type: 'selector',
            key: 'danmaku-area',
            name: player.locales.get('Display Area'),
            children: [25, 50, 80, 100].map((it) => ({
              name: `${it}%`,
              value: it,
              default: it == 100
            })),
            onChange: ({ value }: any) => {
              options.opacity = value
              $danmaku.style.height = `${value}%`
              danmaku.resize()
            }
          }
        ]
      })
    }

    //@ts-ignore
    danmaku!.bootstrap = bootstrap

    return danmaku
  }
})
