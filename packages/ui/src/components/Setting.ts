import Player, { $, PlayerEvent } from '@oplayer/core'
import { siblings } from '../utils'
import {
  activeCls,
  nexter,
  panelCls,
  setting,
  settingItemCls,
  subPanelCls,
  switcher
} from './Setting.style'

export type Setting = {
  name: string
  /**
   * selector 切换下个面板单选 1 ｜ 2 ｜ 3
   * swither  当前面板切换 true or false
   */
  type?: 'selector' | 'switcher'
  children?: Setting[]
  onChange?: Function
  default?: any
  [x: string]: any
}

export default function (player: Player, $el: HTMLElement, options: Setting[] = []) {
  const $dom = $.create(`div.${setting}`),
    $panels: HTMLDivElement[] = []
  let $tigger: HTMLElement | null = null

  function createItem(options: Setting) {
    let $item: HTMLElement = $.create(`div.${settingItemCls}`)
    const res = {
      $: $item,
      $label: undefined as unknown as HTMLElement
    }

    switch (options.type) {
      case 'switcher':
        $item.innerHTML = switcher(options.name)
        $item.setAttribute('data-selected', options.default || false)
        $item.children[0]!.setAttribute('data-selected', options.default || false)
        break
      default:
        $item.innerHTML = nexter(options.name)
        res['$label'] = $item.querySelector('span[role="label"]')!
        break
    }

    return res
  }

  function createPanel(
    $panels: HTMLElement[],
    options: Setting[],
    { onChange, isPatch }: { onChange?: Function; isPatch?: boolean } = {}
  ) {
    if (!options?.length) return

    const $panel =
      isPatch && $panels[0] ? $panels[0] : $.create(`div.${onChange ? subPanelCls : panelCls}`)

    for (let index = 0; index < options.length; index++) {
      const item = options[index]!
      const { $: $item, $label } = createItem(item)
      $.render($item, $panel)

      $item.addEventListener('click', function () {
        switch (item.type) {
          case 'switcher':
            if (onChange) {
              this.setAttribute('data-selected', 'true')
              this.children[0]!.setAttribute('data-selected', 'true')
              siblings(this, (el) => {
                el.setAttribute('data-selected', 'false')
                el.children[0]!.setAttribute('data-selected', 'false')
              })
              $panel.classList.remove(activeCls)
              onChange!(item, index)
            } else {
              const value = this.getAttribute('data-selected') == 'true'
              this.setAttribute('data-selected', `${!Boolean(value)}`)
              this.children[0]!.setAttribute('data-selected', `${!Boolean(value)}`)
              item.onChange?.(!Boolean(value))
              $panel.classList.toggle(activeCls)
            }
            break
          case 'selector':
            $panel.classList.toggle(activeCls)
            break
          default:
            break
        }
      })

      if (item.children) {
        if (item.type == 'selector') {
          const selected = item.children.findIndex((_) => _.default) || 0
          if (selected != -1) {
            $label.innerText = item.children[selected]!.name!
            item.onChange?.(item, selected)
          }
        }

        const $nextPanel = createPanel($panels, item.children, {
          onChange: (option: Setting, index: number) => {
            $label.innerText = option.name
            $panel.classList.add(activeCls)
            item.onChange?.(option, index)
          }
        })

        $item.onclick = () => {
          $nextPanel!.classList.add(activeCls)
        }
      }
    }

    $panels.unshift($panel)

    return $panel
  }

  createPanel($panels, options)
  $panels.forEach(($p) => {
    $.render($p, $dom)
  })

  player.on('addsetting', ({ payload }: PlayerEvent<Setting | Setting[]>) => {
    const oldLen = $panels.length
    createPanel($panels, Array.isArray(payload) ? payload : [payload], { isPatch: true })
    const $needRenderpanels = oldLen > 0 ? $panels.slice(oldLen) : $panels
    $needRenderpanels.forEach(($p) => {
      $.render($p, $dom)
      $panels.push($p)
    })
  })

  player.on('ui/setting:toggle', ({ payload }: PlayerEvent) => {
    $tigger = payload.target
    $panels[0]!.classList.toggle(activeCls)
  })

  function outClicklistener(e: Event) {
    if (
      $tigger != e.target &&
      <HTMLElement>e.target != $dom &&
      !$dom.contains(<HTMLElement>e.target)
    ) {
      $panels[0]!.classList.remove(activeCls)
    }
  }

  document.addEventListener('click', outClicklistener)
  player.on('destroy', () => document.removeEventListener('click', outClicklistener))

  player.emit('ui/setting:loaded')

  // player.emit('addsetting', {
  //   name: 'Subtitle',
  //   type: 'selector',
  //   onChange(item: any, index: number) {
  //     console.log(item, index)
  //   },
  //   children: [
  //     {
  //       type: 'switcher',
  //       name: 'None'
  //     },
  //     {
  //       type: 'switcher',
  //       name: 'Chinese',
  //       default: true
  //     },
  //     {
  //       type: 'switcher',
  //       name: 'English'
  //     }
  //   ]
  // })

  $.render($dom, $el)
}
