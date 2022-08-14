import Player, { $, PlayerEvent } from '@oplayer/core'
import { settingShown } from '../style'
import { siblings } from '../utils'
import {
  activeCls,
  nextIcon,
  nextLabelText,
  panelCls,
  setting,
  settingItemCls,
  settingItemLeft,
  settingItemRight,
  subPanelCls,
  yesIcon
} from './Setting.style'

export type Setting = {
  name: string
  key?: string // children 可无 （用于移除）
  /**
   * selector 切换下个面板单选 1 ｜ 2 ｜ 3
   * swither  当前面板切换 true or false
   */
  type?: 'selector' | 'switcher'
  icon?: string
  children?: Setting[]
  onChange?: Function
  default?: any
  [x: string]: any
}

export type Panel = {
  $ref: HTMLElement
  key: string
}

export const switcher = (name: string, icon: string = '') => `
    <div class="${settingItemLeft}">
      ${icon}
      <span>${name}</span>
    </div>
    <svg class=${yesIcon} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#fff"></path>
    </svg>
`
export const nexter = (name: string, icon: string = '') => `
    <div class="${settingItemLeft}">
      ${icon}
      <span>${name}</span>
    </div>
    <div class=${settingItemRight}>
      <span role="label" class=${nextLabelText}></span>
      <svg class=${nextIcon} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32">
        <path d="m 12.59,20.34 4.58,-4.59 -4.58,-4.59 1.41,-1.41 6,6 -6,6 z" fill="#fff"></path>
      </svg>
    </div>
`

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
      $item.innerHTML = switcher(options.name, options.icon)
      $item.setAttribute('data-selected', options.default || false)
      $item.children[0]!.setAttribute('data-selected', options.default || false)
      break
    default:
      $item.innerHTML = nexter(options.name, options.icon)
      res['$label'] = $item.querySelector('span[role="label"]')!
      break
  }

  return res
}

function createPanel(
  $panels: Panel[],
  options: Setting[],
  {
    onChange,
    onHide,
    isPatch,
    key
  }: { onHide?: Function; onChange?: Function; isPatch?: boolean; key?: string } = {}
) {
  if (!options?.length) return

  let $panel: Panel

  if (isPatch && $panels[0]) {
    $panel = $panels[0]
  } else {
    $panel = {
      $ref: $.create(`div.${onChange ? subPanelCls : panelCls}`, {
        'data-key': key || 'root'
      }),
      key: key || 'root'
    }
    $panels.push($panel)
  }

  for (let index = 0; index < options.length; index++) {
    const item = options[index]!
    const { $: $item, $label } = createItem(item, item.key)
    $.render($item, $panel.$ref)

    $item.addEventListener('click', function () {
      switch (item.type) {
        case 'switcher':
          // 只有第一个 panel 没有onChange
          if (onChange) {
            this.setAttribute('data-selected', 'true')
            siblings(this, (el) => {
              el.setAttribute('data-selected', 'false')
            })
            $panel.$ref.classList.remove(activeCls)
            onChange(item, index)
          } else {
            const value = this.getAttribute('data-selected') == 'true'
            this.setAttribute('data-selected', `${!Boolean(value)}`)
            item.onChange?.(!Boolean(value))
            $panel.$ref.classList.toggle(activeCls)
            onHide!()
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
  const $dom = $.create(`div.${setting}`)
  let $panels: Panel[] = []
  let $tigger: HTMLElement | null = null

  const defaultSetting: Setting[] = [
    {
      name: 'Loop',
      type: 'switcher',
      default: player.isLoop,
      onChange: (value: boolean) => player.setLoop(value)
    }
  ]

  const hide = () => {
    $panels.forEach(($p) => $p.$ref.classList.remove(activeCls))
    player.$root.classList.remove(settingShown)
  }

  createPanel($panels, defaultSetting.concat(options), { onHide: hide })
  $panels.forEach(($p) => $.render($p.$ref, $dom))

  player.on('addsetting', ({ payload }: PlayerEvent<Setting | Setting[]>) => {
    const oldLen = $panels.length
    createPanel($panels, Array.isArray(payload) ? payload : [payload], {
      isPatch: true,
      onHide: hide
    })
    const $needRenderpanels = oldLen > 0 ? $panels.slice(oldLen - 1) : $panels
    $needRenderpanels.forEach(($p) => ($.render($p.$ref, $dom), $panels.push($p)))
  })

  player.on('removesetting', ({ payload }: PlayerEvent<string>) => {
    $panels[0]!.$ref.querySelector(`[data-key=${payload}]`)?.remove()
    $panels = $panels.filter((p) => {
      if (p.key === payload) {
        p.$ref.remove()
        return false
      }
      return true
    })
  })

  player.on('ui/setting:toggle', ({ payload }: PlayerEvent) => {
    $tigger = payload.target
    if (player.$root.classList.toggle(settingShown)) {
      $panels[0]!.$ref.classList.add(activeCls)
    } else {
      hide()
    }
  })

  function outClicklistener(e: Event) {
    if (
      $tigger != e.target &&
      <HTMLElement>e.target != $dom &&
      !$dom.contains(<HTMLElement>e.target)
    ) {
      hide()
    }
  }

  document.addEventListener('click', outClicklistener)
  player.on('destroy', () => document.removeEventListener('click', outClicklistener))

  player.emit('ui/setting:loaded')

  $.render($dom, $el)
}
