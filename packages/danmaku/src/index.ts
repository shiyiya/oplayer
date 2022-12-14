import { $, isIOS, isMobile, Player, PlayerPlugin } from '@oplayer/core'
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

    const { speed, opacity, engine, withSendDom } = options
    const $danmaku = $.render($.create('div'), player.$root)
    $danmaku.style.cssText = `position: absolute;left: 0;top: 0;right: 0;bottom: 0;width: 100%;height: 100%;overflow: hidden;pointer-events: none;text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px;font-family: 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif';color:#fff;`
    if (opacity) $danmaku.style.opacity = `${opacity}`
    if (options.enable == undefined) options.enable = true

    let loaded = false
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

    registerSetting()
    if (withSendDom && !isMobile) registerInput()
    if (options.enable) bootstrap(options.source)

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
      options.source = source
      loaded = options.enable!
      if (options.enable) {
        fetch(source).then((res) => {
          danmaku.clear()
          // @ts-ignore
          danmaku.comments = res.sort((a, b) => a.time - b.time)
          if (options.fontSize) setFontSize(options.fontSize)
          loaded = options.enable! // 没加载完又关了
          if (options.enable) danmaku.show()
        })
      }
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
                if (!loaded) {
                  bootstrap(options.source)
                  return
                }
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

    function registerInput() {
      if (!player.plugins.ui) return
      const { inputBar, inputBarWrap, input, send, sendBottom } = registerInputStyle()
      const $tpl = $.create(
        `div.${inputBar}`,
        {},
        `<div class="${inputBarWrap}">
          <input class="${input}" placeholder="发个友善的弹幕见证当下"/>
        </div>
        <div class="${send}">
          <div class="${sendBottom}">发送</div>
        </div>`
      )

      const parent = document.querySelector(`.${player.plugins.ui.cls.controllerBottom}`)!
      const $input = $tpl.querySelector<HTMLInputElement>(`.${input}`)!
      parent.insertBefore($tpl, parent.children[1]!)

      function submit() {
        if ($input.value) {
          const comment: Comment = {
            text: $input.value,
            time: player.currentTime,
            style: { color: '#fff', fontSize: '25px' }
          }
          if (options.onEmit?.(comment) || true) {
            const primaryColor = window
              .getComputedStyle(player.$root.querySelector(`.${player.plugins.ui.cls.root}`)!)
              .getPropertyValue('--primary-color')

            //@ts-ignore
            comment.style!.border = `2px solid ${primaryColor}`
            //@ts-ignore
            comment.style!.marginTop = '4px'
            danmaku.emit(comment)
            $input.value = ''
            $input.blur()
          }
        }
      }

      $tpl.querySelector(`.${sendBottom}`)!.addEventListener('click', submit)
      $input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submit()
      })
    }

    //@ts-ignore
    danmaku!.bootstrap = bootstrap

    return danmaku
  }
})

function registerInputStyle() {
  const inputBar = $.css(`
  margin: 0.125em 0;
  min-width: 25em;
  border-radius: 6px;
  background: #f4f4f4;
  color: #999;
  overflowL hidden;
`)

  const inputBarWrap = $.css(`
  flex: 1;
  display: flex;
  align-items: center;
`)

  const input = $.css(`
  flex-grow: 1;
  padding: 0 8px;
  height: 28px;
  border: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: none;
  line-height: 28px;
  color: #212121;
  color: #212121;
  font-size: 12px;
  text-decoration: none;
  outline: none;
  touch-action: manipulation;
`)

  const send = $.css(`
  height: 100%;
  width: 62px;
  min-width: 62px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  width: 60px;
  min-width: 60px;
  box-sizing: border-box;
  overflow: hidden;
`)

  const sendBottom = $.css(`
  height: 100%;
  background-color: var(--primary-color,#00a1d6);
  color: #fff;
  min-width: 60px;
  outline: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`)

  return { inputBar, inputBarWrap, input, send, sendBottom }
}
