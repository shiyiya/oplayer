import Player, { $, PlayerEvent } from '@oplayer/core'
import { settingShown } from '../style'
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
  key?: string // children 可无 （用于移除）
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

export type Panel = {
  isRoot: boolean
  $ref: HTMLElement
  key: string
}

function createItem(options: Setting, key?: string) {
  let $item: HTMLElement = $.create(`div.${settingItemCls}`, {
    'data-key': key
  })
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
  $panels: Panel[],
  options: Setting[],
  { onChange, isPatch, key }: { onChange?: Function; isPatch?: boolean; key?: string } = {}
) {
  if (!options?.length) return

  const $panel: Panel =
    isPatch && $panels[0]
      ? $panels[0]
      : {
          $ref: $.create(
            `div.${onChange ? subPanelCls : panelCls}`,

            {
              'data-key': key || 'root'
            }
          ),
          isRoot: !!!onChange,
          key: key || 'root'
        }
  if (!(isPatch && $panels[0])) $panels.push($panel)

  console.log(!(isPatch && $panels[0]), $panel)

  for (let index = 0; index < options.length; index++) {
    const item = options[index]!
    const { $: $item, $label } = createItem(item, item.key)
    $.render($item, $panel.$ref)

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
            $panel.$ref.classList.remove(activeCls)
            onChange(item, index)
          } else {
            const value = this.getAttribute('data-selected') == 'true'
            this.setAttribute('data-selected', `${!Boolean(value)}`)
            this.children[0]!.setAttribute('data-selected', `${!Boolean(value)}`)
            item.onChange?.(!Boolean(value))
            $panel.$ref.classList.toggle(activeCls)
          }
          break
        case 'selector':
          $panel.$ref.classList.toggle(activeCls)
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
          item.onChange?.(item.children[selected], selected)
        }
      }

      const $nextPanel = createPanel($panels, item.children, {
        onChange: (option: Setting, index: number) => {
          $label.innerText = option.name
          $panel.$ref.classList.add(activeCls)
          item.onChange?.(option, index)
        },
        key: key || item.key || item.name
      })

      $item.onclick = () => {
        $nextPanel!.$ref.classList.add(activeCls)
      }
    }
  }

  return $panel
}

export default function (player: Player, $el: HTMLElement, options: Setting[] = []) {
  const $dom = $.create(`div.${setting}`),
    $panels: Panel[] = []
  let $tigger: HTMLElement | null = null

  const defaultSetting: Setting[] = [
    {
      name: 'Loop',
      type: 'switcher',
      key: 'subtitle',
      default: player.isLoop,
      onChange: (value: boolean) => player.setLoop(value)
    }
  ]

  createPanel($panels, defaultSetting.concat(options))
  $panels.forEach(($p) => $.render($p.$ref, $dom))

  player.on('addsetting', ({ payload }: PlayerEvent<Setting | Setting[]>) => {
    const oldLen = $panels.length
    createPanel($panels, Array.isArray(payload) ? payload : [payload], { isPatch: true })
    const $needRenderpanels = oldLen > 0 ? $panels.slice(oldLen - 1) : $panels
    $needRenderpanels.forEach(($p) => ($.render($p.$ref, $dom), $panels.push($p)))
  })

  player.on('removesetting', ({ payload }: PlayerEvent<string>) => {
    $panels[0]!.$ref.querySelector(`[data-key=${payload}]`)?.remove()
    $panels.slice(1).forEach((p, i) => {
      if (p.key === payload) {
        p.$ref.remove()
        $panels.splice(i, 0)
      }
    })
  })

  player.on('ui/setting:toggle', ({ payload }: PlayerEvent) => {
    $tigger = payload.target
    $panels[0]!.$ref.classList.toggle(activeCls)
    player.$root.classList.toggle(settingShown)
  })

  function outClicklistener(e: Event) {
    if (
      $tigger != e.target &&
      <HTMLElement>e.target != $dom &&
      !$dom.contains(<HTMLElement>e.target)
    ) {
      $panels[0]!.$ref.classList.remove(activeCls)
      player.$root.classList.remove(settingShown)
    }
  }

  document.addEventListener('click', outClicklistener)
  player.on('destroy', () => document.removeEventListener('click', outClicklistener))

  player.emit('ui/setting:loaded')

  $.render($dom, $el)
}
