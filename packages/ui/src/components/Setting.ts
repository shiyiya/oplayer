import Player, { $, PlayerEvent } from '@oplayer/core'
import loopSvg from '../icons/loop.svg?raw'
import { settingShown } from '../style'
import type { Setting } from '../types'
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
  switcherText,
  yesIcon
} from './Setting.style'

export const switcher = (name: string, icon: string = '', closedText?: string) =>
  `<div class="${settingItemLeft}">
      ${icon}
      <span>${name}</span>
    </div>
    <svg class=${yesIcon} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#fff"></path>
    </svg>
    ${closedText ? `<span role="label" class=${switcherText}>${closedText}</span>` : ''}
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

function createRow({
  type,
  key,
  name,
  icon,
  default: selected,
  index,
  switcherLabe
}: Omit<Setting, 'onChange' | 'children' | 'value'> & { index?: number; switcherLabe?: string }) {
  let $item: HTMLElement = $.create(`div.${settingItemCls}`, {
    'data-key': key
  })
  const res = {
    $row: $item,
    $label: undefined as unknown as HTMLElement
  }

  switch (type) {
    case 'switcher':
      $item.innerHTML = switcher(name, icon, switcherLabe)
      $item.setAttribute('data-selected', selected || false)
      if (typeof index == 'number') {
        $item.setAttribute('data-index', index.toString())
      }
      break
    default:
      $item.innerHTML = nexter(name, icon)
      res['$label'] = $item.querySelector('span[role="label"]')!
      break
  }

  return res
}

export type Panel = {
  $ref: HTMLElement
  key: string
  // isSelector: boolean
  onHide?: Function
  select?: Function // 全是选项才有
  parent?: Panel
}

function createPanel(
  player: Player,
  panels: Panel[],
  setting: Setting[], // 菜单选项 | 选择面板
  options: {
    /**
     * 合入第一个options
     */
    isPatch?: boolean
    /**
     * 全是选项面板的用上一个面板的key
     */
    key?: string
    target: HTMLElement
    parent?: Panel
  } = {} as any
): Panel | void {
  if (!setting || setting.length == 0) return
  const { isPatch, key: parentKey, target, parent } = options

  let panel = {} as Panel
  let key: string = parentKey! || 'root'
  let isRoot = false
  let isSelectorOptionsPanel = setting.every((it) => it.type == 'switcher')

  if (isPatch) {
    panel = panels[0]! // 将 options 挂在第一个面板
    key = panels[0]!.key
  } else {
    //创建新的选项面板
    panel.$ref = $.create(`div.${panels[0] && isSelectorOptionsPanel ? subPanelCls : panelCls}`, {
      'data-key': key
    })
    panel.key = key
    panels.push(panel)
  }

  panel.parent = parent
  if (panel.key == 'root') isRoot = true

  for (let i = 0; i < setting.length; i++) {
    const { name, type, key, children, icon, default: selected, onChange } = setting[i]!

    const { $row, $label } = createRow(
      Object.assign(
        {
          name,
          type,
          key: key,
          icon,
          default: selected
        },
        !isSelectorOptionsPanel && { switcherLabe: player.locales.get('OFF') },
        !isRoot && isSelectorOptionsPanel && { index: i }
      )
    )
    $.render($row, panel.$ref)
    $.render(panel.$ref, target)

    if (children) {
      const optionPanel = createPanel(player, panels, children, {
        key,
        target,
        parent: panel
      })!

      $row.addEventListener('click', () => {
        panel.$ref.classList.remove(activeCls)
        optionPanel.$ref.classList.add(activeCls)
      })

      if (children.every((it) => it.type == 'switcher')) {
        const defaultSelected = children.find((it) => it.default)
        if (defaultSelected) {
          $label.innerText = defaultSelected.name
        }

        optionPanel.select = (i: number) => {
          const childrenElm = optionPanel.$ref.children
          if (childrenElm[i]!.getAttribute('data-selected') != 'true') {
            childrenElm[i]!.setAttribute('data-selected', 'true')
            siblings(<HTMLDivElement>childrenElm[i], (sibling) => {
              sibling.setAttribute('data-selected', 'false')
            })
            const value = children[i]
            $label.innerText = value!.name
            onChange?.(value, { index: i })
          }

          panel.$ref.classList.add(activeCls)
          optionPanel.$ref.classList.remove(activeCls)
        }

        optionPanel.$ref.addEventListener('click', (e) => {
          const target = (<HTMLDivElement>e.target) as HTMLDivElement
          const index = +target.getAttribute('data-index')!
          optionPanel.select!(index)
        })
      }
    } else {
      // 非 root 和全部是选项 被上面 children 覆盖
      if (isRoot || !isSelectorOptionsPanel) {
        if (type == 'switcher') {
          $row.addEventListener('click', function () {
            const selected = this.getAttribute('data-selected') == 'true'
            this.setAttribute('data-selected', `${!selected}`)
            panel.$ref.classList.remove(activeCls)
            if (isRoot) {
              panels[0]!.onHide?.()
            } else {
              panel.parent!.$ref.classList.add(activeCls)
            }
            onChange?.(!selected)
          })
        }
      }
    }
  }

  return panel
}

export default function (player: Player, $el: HTMLElement, options: Setting[] = []) {
  const $dom = $.create(`div.${setting}`)
  let panels: Panel[] = []
  let $trigger: HTMLElement | null = null

  const defaultSetting: Setting[] = [
    {
      name: player.locales.get('Loop'),
      type: 'switcher',
      key: 'loop',
      icon: loopSvg,
      default: player.isLoop,
      onChange: (value: boolean) => player.setLoop(value)
    },
    ...options
  ]

  createPanel(player, panels, defaultSetting, { target: $dom })

  player.on('registersetting', ({ payload }: PlayerEvent<Setting | Setting[]>) => {
    createPanel(player, panels, Array.isArray(payload) ? payload : [payload], {
      isPatch: true,
      target: $dom
    })
  })

  player.on('updatesettinglabel', ({ payload }: PlayerEvent<Setting>) => {
    const $item = $dom.querySelector<HTMLSpanElement>(
      `[data-key="${payload.key}"] span[role="label"]`
    )
    if ($item) $item.innerText = payload.name
  })

  TODO: player.on(
    'selectsetting',
    ({ payload: { key, value } }: PlayerEvent<{ key: string; value: boolean | number }>) => {
      if (typeof value == 'number') {
        panels.some((it) => {
          if (it.key == key) {
            it.select!(value)
            return true
          }
          return false
        })
      } else {
        $dom.querySelector<HTMLSpanElement>(`[data-key="${key}"][data-selected]`)?.click()
      }
    }
  )

  player.on('unregistersetting', ({ payload }: PlayerEvent<string>) => {
    panels[0]!.$ref.querySelector(`[data-key=${payload}]`)?.remove()
    panels = panels.filter((p) => {
      if (p.key === payload) {
        p.$ref.remove()
        return false
      }
      return true
    })
  })

  let isShow = false

  panels[0]!.onHide = () => {
    isShow = false
    player.$root.classList.remove(settingShown)
  }

  player.on('settingvisibilitychange', ({ payload }: PlayerEvent) => {
    $trigger = payload.target
    isShow = player.$root.classList.toggle(settingShown)
    if (isShow) {
      panels[0]!.$ref.classList.toggle(activeCls)
    } else {
      panels.forEach(($p) => $p.$ref.classList.remove(activeCls))
    }
  })

  function outClickListener(e: Event) {
    if (
      $trigger != e.target &&
      <HTMLElement>e.target != $dom &&
      !$dom.contains(<HTMLElement>e.target)
    ) {
      isShow = false
      player.$root.classList.remove(settingShown)
      panels.forEach(($p) => $p.$ref.classList.remove(activeCls))
    }
  }

  document.addEventListener('click', outClickListener)
  player.on('destroy', () => document.removeEventListener('click', outClickListener))

  $.render($dom, $el)
  setTimeout(() => player.emit('loadedsetting'))
}
