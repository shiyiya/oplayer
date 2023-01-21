import type Player from '@oplayer/core'
import {
  controllerBottom,
  dropdown,
  dropdownHoverable,
  dropItem,
  expand,
  expandBottom,
  textIcon
} from '../components/ControllerBottom.style'
import { icon as iconCls, tooltip } from '../style'
import type { MenuBar } from '../types'
import { siblings } from '../utils'
import { controlBar } from './ControllerBar'

const _select = (elm: HTMLElement) => {
  const selected = elm.getAttribute('aria-checked') == 'true'
  elm.setAttribute('aria-checked', `${!selected}`)
  siblings(elm, (it) => it.setAttribute('aria-checked', `${selected}`))
}

export default (_: Player, elm: HTMLElement, initialState?: MenuBar[]) => {
  const menus: MenuBar[] = []
  const $top = elm.querySelector(`.${controlBar}`)!?.children?.[1]! as HTMLDivElement
  const $end = elm.querySelector(`.${controllerBottom}`)?.children?.[1]! as HTMLDivElement
  const $targets = [$top, $end].filter(Boolean)

  if (initialState) initialState.forEach((it) => register(it))

  function clickHandler(e: Event) {
    const elm: HTMLElement = e.target as HTMLElement
    const label = elm.getAttribute('aria-label')
    const target = menus.find((it) => it.name == label)

    if (!target || elm.getAttribute('aria-checked') == 'true') return

    if (elm.tagName.toUpperCase() == 'SPAN') {
      _select(elm)
      target.onChange?.(
        target.children[+elm.getAttribute('data-index')!]!,
        elm.parentElement!.previousElementSibling as HTMLButtonElement
      )
    } else if (elm.tagName.toUpperCase() == 'BUTTON') {
      target.onClick?.(elm as any)
    }
  }

  $targets.forEach((it) => {
    it.addEventListener('click', clickHandler)
  })

  function register(menu: MenuBar) {
    const isTop = menu.position == 'top' && $targets.length == 2
    const { name, icon, children } = menu
    let $menu: string = ''
    const $button = `
    <button
      aria-label="${name}"
      data-tooltip-pos="${isTop ? 'bottom-right' : ''}"
      class="${iconCls} ${!icon ? textIcon : ''} ${!menu.children ? tooltip : ''}"
      type="button"
    >${icon || name}</button>`

    if (menu.children) {
      $menu = `
      <div class="${dropdown} ${dropdownHoverable}" data-dropdown-pos="${
        menu.position
      }" aria-label="${name}">
        ${$button}
        <div class='${expand} ${isTop ? expandBottom : ''}' role='menu'>
          ${children
            .map(
              (it, i) =>
                `<span
                  role="menuitemradio"
                  aria-haspopup="false"
                  aria-label="${name}"
                  class="${dropItem}"
                  aria-checked="${Boolean(it.default)}"
                  data-index="${i}"
                >${it.name}</span>`
            )
            .join('')}
          </div>
      </div>`
    } else {
      $menu = $button
    }

    menus.push(menu)
    if (isTop) {
      $top?.insertAdjacentHTML('afterbegin', $menu)
    } else {
      $end.insertAdjacentHTML('afterbegin', $menu)
    }
  }

  function unregister(name: string) {
    $targets.forEach((it) => {
      it.querySelector(`button[aria-label=${name}]`)?.remove()
      it.querySelector(`div[aria-label=${name}]`)?.remove()
    })
  }

  function select(name: string, index: number) {
    $targets.forEach((it) => {
      _select(it.querySelector(`.${expand} > span[aria-label=${name}]:nth-child(${index + 1})`)!)
    })
  }

  return { register, unregister, select }
}
