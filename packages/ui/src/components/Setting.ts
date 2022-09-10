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

export type Panel = {
  $ref: HTMLElement
  key: string
}

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

function createItem(
  options: Setting,
  { key, closedText, isAllSwitch }: { key?: string; isAllSwitch: boolean; closedText: string }
) {
  let $item: HTMLElement = $.create(`div.${settingItemCls}`, {
    'data-key': key
  })
  const res = {
    $: $item,
    $label: undefined as unknown as HTMLElement
  }

  switch (options.type) {
    case 'switcher':
      $item.innerHTML = switcher(options.name, options.icon, isAllSwitch ? undefined : closedText)
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
  player: Player,
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

  // 只有第一个 panel 没有onChange
  const isRoot = !Boolean(onChange)
  // 整个面板全部是 switcher
  const isAllSwitch = !isRoot && options.every((it) => it.type === 'switcher')

  for (let index = 0; index < options.length; index++) {
    const item = options[index]!

    const { $: $item, $label } = createItem(item, {
      key: item.key,
      isAllSwitch,
      closedText: player.locales.get('OFF')
    })
    $.render($item, $panel.$ref)

    $item.addEventListener('click', function () {
      switch (item.type) {
        case 'switcher':
          if (isAllSwitch) {
            this.setAttribute('data-selected', 'true')
            siblings(this, (el) => {
              el.setAttribute('data-selected', 'false')
            })
            $panel.$ref.classList.remove(activeCls)
            onChange!(item, { index })
          } else {
            const value = this.getAttribute('data-selected') == 'true'
            this.setAttribute('data-selected', `${!Boolean(value)}`)
            item.onChange?.(!Boolean(value), { isInit: false })

            if (isRoot) {
              onHide!()
            } else {
              $panel.$ref.classList.remove(activeCls)
            }
          }

          break
        case 'selector':
          $panel.$ref.classList.toggle(activeCls)
          break
        default:
          break
      }
    })

    if (isRoot && item.default && item.type == 'switcher') {
      item.onChange!(item.default, { isInit: true })
    }

    if (item.children) {
      if (item.type == 'selector') {
        //TODO: children.children
        const selected = item.children.findIndex((_) => _.default)
        if (item.children[selected]) {
          $label.innerText = item.children[selected]!.name!
          item.onChange?.(item.children[selected], { index: selected, isInit: true })
        }
      }

      const $nextPanel = createPanel(player, $panels, item.children, {
        onChange: (option: Setting, index: number) => {
          $label.innerText = option.name
          $panel.$ref.classList.add(activeCls)
          item.onChange?.(option, { index })
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
  let $trigger: HTMLElement | null = null

  const defaultSetting: Setting[] = [
    {
      name: player.locales.get('Loop'),
      type: 'switcher',
      icon: loopSvg,
      default: player.isLoop,
      onChange: (value: boolean) => player.setLoop(value)
    },
    ...options
  ]

  const hide = () => {
    $panels.forEach(($p) => $p.$ref.classList.remove(activeCls))
    player.$root.classList.remove(settingShown)
  }

  createPanel(player, $panels, defaultSetting, { onHide: hide })
  $panels.forEach(($p) => $.render($p.$ref, $dom))

  player.on('addsetting', ({ payload }: PlayerEvent<Setting | Setting[]>) => {
    const oldLen = $panels.length
    createPanel(player, $panels, Array.isArray(payload) ? payload : [payload], {
      isPatch: true,
      onHide: hide
    })
    const $needRenderPanels = oldLen > 0 ? $panels.slice(oldLen - 1) : $panels
    $needRenderPanels.forEach(($p) => ($.render($p.$ref, $dom), $panels.push($p)))
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

  player.on('settingvisibilitychange', ({ payload }: PlayerEvent) => {
    $trigger = payload.target
    if (player.$root.classList.toggle(settingShown)) {
      $panels[0]!.$ref.classList.add(activeCls)
    } else {
      hide()
    }
  })

  function outClickListener(e: Event) {
    if (
      $trigger != e.target &&
      <HTMLElement>e.target != $dom &&
      !$dom.contains(<HTMLElement>e.target)
    ) {
      hide()
    }
  }

  document.addEventListener('click', outClickListener)
  player.on('destroy', () => document.removeEventListener('click', outClickListener))

  player.emit('loadedsetting')

  $.render($dom, $el)
}
