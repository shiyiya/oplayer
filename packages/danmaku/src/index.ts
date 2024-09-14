import type { Player, PlayerPlugin, RequiredPartial } from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { default as _Danmaku } from 'danmaku'
import { danmakuParseFromUrl } from './danmaku-parse'
import type { Comment, DanmakuContext, Options } from './types'

import danmakuSvg from './danmaku.svg?raw'
import heatmap from './heatmap'
import { registerInput } from './sender'

export * from './types'

// oic=cid
// https://cors-flame.vercel.app/api/stream?url=https://api.bilibili.com/x/v1/dm/list.so?oid=144541892

export default class Danmaku implements PlayerPlugin {
  key = 'danmaku'
  name = 'oplayer-plugin-danmaku'
  version = __VERSION__

  player: Player
  danmaku: DanmakuContext

  loaded: boolean = false
  $root: HTMLDivElement

  options: RequiredPartial<Options, 'source' | 'onEmit'> = {
    speed: 144,
    opacity: 1,
    engine: 'dom',
    area: 1,
    fontSize: 1,
    heatmap: true,
    enable: true,
    displaySender: false
  }

  constructor(options = {} as Options) {
    Object.assign(this.options, options)
  }

  apply(player: Player) {
    if (player.isNativeUI) return
    this.player = player

    this.render()

    const danmaku = this.danmaku
    player.on('fullscreenchange', () => {
      danmaku.resize()
    })

    player.on('videosourcechange', () => {
      danmaku.clear()
      danmaku.comments = []
      this.loaded = false
      this.options.source = undefined
    })

    const resize = danmaku.resize.bind(danmaku)
    window.addEventListener('resize', resize)
    player.on('destroy', () => {
      danmaku.destroy()
      window.removeEventListener('resize', resize)
    })

    this.registerSetting()
    this.bootstrap(this.options.source!)
    if (this.options.displaySender && !isMobile) registerInput(player, danmaku, this.options as any)
  }

  bootstrap(source: Options['source']) {
    this.loaded = false
    this.options.source = source
    this.danmaku.clear()
    if (!this.options.enable) return
    this._fetchSource(source)
  }

  async _fetchSource(source: Options['source']) {
    try {
      let danmakus: Comment[]
      if (typeof source === 'function') {
        danmakus = await source()
      } else if (typeof source === 'string') {
        danmakus = (await danmakuParseFromUrl(source)) as any
      } else {
        danmakus = source
      }

      const { danmaku, player } = this
      const { fontSize, enable, heatmap: heatmapEnable } = this.options

      //@ts-ignore
      if (!danmaku._) return

      danmaku.comments = danmakus.sort((a, b) => a.time! - b.time!)
      danmaku.comments.forEach((comment: any) => {
        if (comment.style?.fontSize) {
          comment.defaultFontSize = comment.style.fontSize.slice(0, -2)
        }
      })

      this.loaded = true
      if (fontSize) danmaku.setFontSize(fontSize)
      if (enable) danmaku.show()
      if (Boolean(heatmapEnable) && danmaku.comments.length > 0) {
        if (isNaN(player.duration)) {
          player.once('loadedmetadata', () => {
            heatmap(player, danmaku, heatmapEnable)
          })
        } else {
          heatmap(player, danmaku, heatmapEnable)
        }
      }
    } catch (error) {
      this.player.emit('notice', { text: 'danmaku: ' + (<Error>error).message })
      throw error
    }
  }

  setFontSize(value: number) {
    this.danmaku.comments.forEach((comment: any) => {
      if (comment.style?.fontSize) {
        comment.style.fontSize = `${comment.defaultFontSize * value}px`
      }
    })
  }

  registerSetting() {
    const { danmaku, player, loaded } = this
    const { enable, source, heatmap: heatmapEnable, opacity, area } = this.options

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
          default: enable,
          key: 'danmaku-switcher',
          onChange: (value: boolean) => {
            this.options.enable = value
            if (value) {
              if (!loaded) {
                this.bootstrap(source!)
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
          onChange: (value: boolean) => {
            this.options.heatmap = value
            if (value) danmaku.heatmap?.enable()
            else danmaku.heatmap?.disable()
          }
        },
        {
          type: 'slider',
          key: 'danmaku-font',
          max: 1.25,
          min: 0.25,
          step: 0.25,
          default: 1,
          name: player.locales.get('FontSize'),
          onChange: ({ value }: any) => {
            this.options.fontSize = value
            danmaku.setFontSize(value)
          }
        },
        {
          type: 'slider',
          key: 'danmaku-opacity',
          name: player.locales.get('Opacity'),
          max: 1,
          min: 0.1,
          step: 0.1,
          default: opacity,
          onChange: ({ value }: any) => {
            this.options.opacity = value
            this.$root.style.opacity = value
          }
        },
        {
          type: 'slider',
          key: 'danmaku-area',
          name: player.locales.get('Display Area'),
          max: 1,
          min: 0.1,
          step: 0.1,
          default: area,
          onChange: ({ value }: any) => {
            this.options.area = value
            this.$root.style.height = `${value * 100}%`
            danmaku.resize()
          }
        }
      ]
    })
  }

  render() {
    const { opacity, area, engine, speed } = this.options
    const player = this.player
    const $danmaku = $.render($.create('div'), player.$root)
    $danmaku.style.cssText = `height:${area * 100}%;opacity:${opacity};font-weight: normal;position: absolute;left: 0;top: 0;width: 100%;height: 100%;overflow: hidden;pointer-events: none;text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px;color:#fff;`
    this.danmaku = new _Danmaku({
      container: $danmaku,
      media: player.$video,
      engine: engine,
      comments: [],
      speed: isMobile ? speed / 1.5 : speed
    }) as any
  }
}
