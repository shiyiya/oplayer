import type { Player, PlayerPlugin, RequiredPartial } from '@oplayer/core'
import { $, isMobile } from '@oplayer/core'
import { default as _Danmaku } from 'danmaku'
import { danmakuParseFromUrl } from './danmaku-parse'
import type { Comment, DanmakuContext, Options } from './types'
import danmakuSvg from './danmaku.svg?raw'
import { registerInput } from './sender'
import Heatmap from './heatmap'

export * from './types'

// oic=cid
// https://cors-flame.vercel.app/api/stream?url=https://api.bilibili.com/x/v1/dm/list.so?oid=144541892

export default class Danmaku implements PlayerPlugin {
  key = 'danmaku'
  name = 'oplayer-plugin-danmaku'
  version = __VERSION__

  player: Player
  danmaku: DanmakuContext
  heatmap: Heatmap

  loaded: boolean = false
  $root: HTMLDivElement

  options: RequiredPartial<Options, 'source' | 'onEmit' | 'customHeatmap'> = {
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
      this.options.source = undefined
      this.loaded = false
      this.danmaku = null as any
      this.$root = null as any
      window.removeEventListener('resize', resize)
    })

    this.registerSetting()
    this.changeSource(this.options.source)
    if (this.options.displaySender && !isMobile) {
      registerInput(player, danmaku, this.options as any)
    }

    return this
  }

  changeSource(source: Options['source'], customHeatmap?: Options['customHeatmap']) {
    if (!source) return
    this.loaded = false
    this.options.source = source
    this.danmaku.clear()
    if (!this.options.enable) return
    this._fetchSource(source, customHeatmap)
  }

  async _fetchSource(source: Options['source'], customHeatmap?: Options['customHeatmap']) {
    try {
      let danmakus: Comment[]
      if (typeof source === 'function') {
        danmakus = await source()
      } else if (typeof source === 'string') {
        danmakus = (await danmakuParseFromUrl(source)) as any
      } else {
        danmakus = source!
      }

      const { danmaku, options } = this
      const { fontSize, enable, heatmap } = options

      //@ts-ignore
      if (!danmaku._) return

      danmaku.comments = danmakus.sort((a, b) => a.time! - b.time!)
      danmaku.comments.forEach((comment: any) => {
        if (comment.style?.fontSize) {
          comment.defaultFontSize = comment.style.fontSize.slice(0, -2)
        }
      })

      this.loaded = true
      this.setFontSize(fontSize)
      if (enable) danmaku.show()
      if (heatmap) this.heatmap.enable(customHeatmap)
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
    const { danmaku, player } = this
    const { enable, heatmap: heatmapEnable, opacity, area } = this.options

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
              if (!this.loaded) {
                this.changeSource(this.options.source)
              } else {
                danmaku.show()
              }
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
            if (value) this.heatmap.enable()
            else this.heatmap.disable()
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
          onChange: (value: any) => {
            this.options.fontSize = value
            this.setFontSize(value)
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
          onChange: (value: any) => {
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
          onChange: (value: any) => {
            this.options.area = value
            this.$root.style.height = `${value * 100}%`
            danmaku.resize()
          }
        }
      ]
    })
  }

  render() {
    const { opacity, area, engine, speed, heatmap, customHeatmap } = this.options
    const player = this.player
    this.$root = $.render($.create('div'), player.$root)
    this.$root.style.cssText = `height:${area * 100}%;opacity:${opacity};font-weight: normal;position: absolute;left: 0;top: 0;width: 100%;height: 100%;overflow: hidden;pointer-events: none;text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px;color:#fff;`
    this.danmaku = new _Danmaku({
      container: this.$root,
      media: player.$video,
      engine: engine,
      comments: [],
      speed: isMobile ? speed / 1.5 : speed
    }) as any
    this.heatmap = new Heatmap(player, this.danmaku, heatmap, customHeatmap)
  }
}
