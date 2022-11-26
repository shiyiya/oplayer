import type Player from '@oplayer/core'
import {
  controllerBottom,
  dropdown,
  dropdownHoverable,
  dropItem,
  expand
} from '../components/ControllerBottom.style'
import { icon as iconCls } from '../style'
import type { MenuBar } from '../types'
import { siblings } from '../utils'

const _select = (elm: HTMLElement) => {
  const selected = elm.getAttribute('data-selected') == 'true'
  elm.setAttribute('data-selected', `${!selected}`)
  siblings(elm, (it) => it.setAttribute('data-selected', `${selected}`))
}

export default (_: Player, elm: HTMLElement, initialState?: MenuBar[]) => {
  const menus: MenuBar[] = []
  const $bar = elm.querySelector(`.${controllerBottom}`)!.children[1]! as HTMLDivElement

  if (initialState) initialState.forEach((it) => register(it))

  $bar.addEventListener('click', (e) => {
    const elm: HTMLElement = e.target as HTMLElement
    const label = elm.getAttribute('aria-label')
    const target = menus.find((it) => it.name == label)

    if (!target || elm.getAttribute('data-selected') == 'true') return

    if (elm.tagName.toUpperCase() == 'SPAN') {
      _select(elm)
      target.onChange?.(target.children[+elm.getAttribute('data-index')!]!)
    } else if (elm.tagName.toUpperCase() == 'BUTTON') {
      target.onClick?.(elm as any)
    }
  })

  function register(menu: MenuBar) {
    const { name, icon, children } = menu
    let $menu: string = ''
    const $button = `
    <button
      aria-label="${name}"
      class="${iconCls} ${!icon ? '--text' : ''}"
      type="button"
    >${icon || name}</button>`

    if (menu.children) {
      $menu = `
      <div class="${dropdown} ${dropdownHoverable}" aria-label="${name}">
        ${$button}
        <div class=${expand}>
          ${children
            .map(
              (it, i) =>
                `<span
                  aria-label=${name}
                  class=${dropItem}
                  data-selected=${Boolean(it.default)}
                  data-index=${i}
                >${it.name}</span>`
            )
            .join('')}
          </div>
      </div>`
    } else {
      $menu = $button
    }

    menus.push(menu)
    $bar.insertAdjacentHTML('afterbegin', $menu)
  }

  function unregister(name: string) {
    $bar.querySelector(`button[aria-label=${name}]`)?.remove()
    $bar.querySelector(`div[aria-label=${name}]`)?.remove()
  }

  function select(name: string, index: number) {
    _select($bar.querySelector(`.${expand} > span[aria-label=${name}]:nth-child(${index + 1})`)!)
  }

  return { register, unregister, select }
}
