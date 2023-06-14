import type { Player, PlayerPlugin } from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import Danmaku from 'danmaku'
import { danmakuParseFromUrl } from './danmaku-parse'
import type { Comment, DanmakuContext, Options } from './types'

import danmakuSvg from './danmaku.svg?raw'
import heatmap from './heatmap'
import { registerInput } from './sender'

export * from './types'

// oic=cid
// https://cors-flame.vercel.app/api/stream?url=https://api.bilibili.com/x/v1/dm/list.so?oid=144541892

export default (options = {} as Options): PlayerPlugin => ({
  key: 'danmaku',
  name: 'oplayer-plugin-danmaku',
  version: __VERSION__,
  apply: (player: Player): DanmakuContext => {
    //@ts-ignore
    if (player.isNativeUI) return

    const { speed = 144, opacity, engine = 'dom', displaySender, area = 0.8, fontSize } = options

    const $danmaku = $.render($.create('div'), player.$root)
    $danmaku.style.cssText = `font-weight: normal;position: absolute;left: 0;top: 0;width: 100%;height: 100%;overflow: hidden;pointer-events: none;text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px;color:#fff;`
    $danmaku.style.height = `${area * 100}%`

    if (opacity) $danmaku.style.opacity = `${opacity}`
    if (options.enable == undefined) options.enable = true
    let heatmapEnable = options.heatmap == undefined || options.heatmap || heatmap.length

    let loaded = false
    const danmaku: DanmakuContext = new Danmaku({
      container: $danmaku,
      media: player.$video,
      engine: engine,
      comments: [],
      speed: isMobile ? speed / 1.5 : speed
    }) as any

    danmaku.setFontSize = function setFontSize(value: number) {
      danmaku.comments.forEach((comment: any) => {
        if (comment.style?.fontSize) {
          comment.style.fontSize = `${comment.defaultFontSize * value}px`
        }
      })
    }

    danmaku.bootstrap = function bootstrap(source: Options['source']) {
      options.source = source
      if (options.enable) {
        return fetchSource(source).then((res) => {
          //@ts-ignore 已销毁
          if (!danmaku._) return

          danmaku.clear()
          danmaku.comments = res.sort((a, b) => a.time! - b.time!)
          danmaku.comments.forEach((comment: any) => {
            if (comment.style?.fontSize) {
              comment.defaultFontSize = comment.style.fontSize.slice(0, -2)
            }
          })
          loaded = true
          if (fontSize) danmaku.setFontSize(fontSize)
          if (options.enable) danmaku.show()
          if (heatmapEnable && danmaku.comments.length > 0) {
            if (isNaN(player.duration)) {
              player.once('loadedmetadata', () => {
                heatmap(player, danmaku, options.heatmap)
              })
            } else {
              heatmap(player, danmaku, options.heatmap)
            }
          }
        })
      }

      return Promise.resolve()
    }

    player.on('fullscreenchange', () => {
      danmaku.resize()
    })

    player.on('videosourcechange', () => {
      danmaku.clear()
      danmaku.comments = []
      loaded = false
      options.source = undefined as any
    })

    const resize = danmaku.resize.bind(danmaku)
    window.addEventListener('resize', resize)
    player.on('destroy', () => {
      danmaku.destroy()
      window.removeEventListener('resize', resize)
    })

    async function fetchSource(source: Options['source']) {
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

    function registerSetting() {
      player.context.ui?.setting.register({
        name: player.locales.get('Danmaku'),
        type: 'selector',
        default: true,
        key: 'danmaku',
        icon: player.context.ui?.icons.danmalu ?? danmakuSvg,
        children: [
          {
            name: player.locales.get('Display'),
            type: 'switcher',
            default: options.enable ?? true,
            key: 'danmaku-switcher',
            onChange: (value: boolean) => {
              options.enable = value
              if (value) {
                if (!loaded) {
                  danmaku.bootstrap(options.source)
                  return
                }
                danmaku.show()
              } else {
                danmaku.hide()
              }
            }
          },
          {
            name: player.locales.get('Heatmap'),
            type: 'switcher',
            default: heatmapEnable,
            key: 'heatmap',
            onChange: (value: Boolean) => {
              if (value) danmaku.heatmap?.enable()
              else danmaku.heatmap?.disable()
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
              danmaku.setFontSize(value)
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
              default: it == area * 100
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

    registerSetting()
    if (options.enable) danmaku.bootstrap(options.source)
    if (displaySender && !isMobile) registerInput(player, danmaku, options)

    return danmaku
  }
})
