import Player, { PlayerEvent } from '@oplayer/core'
import { icon as iconCls } from '../style'
import {
  dropdown,
  dropdownHoverable,
  expand,
  dropItem,
  controllerBottom
} from '../components/ControllerBottom.style'
import type { MenuBar } from '../types'
import { siblings } from '../utils'

const select = (elm: HTMLElement) => {
  const selected = elm.getAttribute('data-selected') == 'true'
  elm.setAttribute('data-selected', `${!selected}`)
  siblings(elm, (it) => it.setAttribute('data-selected', `${selected}`))
}

export default (player: Player, initialState?: MenuBar[]) => {
  let $bar: HTMLDivElement
  const menus: MenuBar[] = []
  let queue: MenuBar[] = []

  if (initialState) queue.push(...initialState)

  setTimeout(() => {
    $bar = document.querySelector(`.${controllerBottom}`)!.children[1]! as HTMLDivElement
    $bar.addEventListener('click', (e) => {
      const elm: HTMLElement = e.target as HTMLElement
      const label = elm.getAttribute('aria-label')
      const target = menus.find((it) => it.name == label)

      if (!target || elm.getAttribute('data-selected') == 'true') return

      if (elm.tagName.toUpperCase() == 'SPAN') {
        select(elm)
        target?.onChange?.(target.children[+elm.getAttribute('data-index')!]!)
      } else if (elm.tagName.toUpperCase() == 'BUTTON') {
        target?.onClick?.(elm as any)
      }
    })
    queue.forEach((it) => create(it))
  })

  player.on('menubar:register', ({ payload }) => {
    if (!$bar) {
      queue.push(payload)
    } else {
      create(payload)
    }
  })

  player.on('menubar:unregister', ({ payload }) => {
    $bar.querySelector(`button[aria-label=${payload.name}]`)?.remove()
    $bar.querySelector(`div[aria-label=${payload.name}]`)?.remove()
  })

  player.on('menubar:select', ({ payload }: PlayerEvent<{ name: string; index: number }>) => {
    select(
      $bar.querySelector(
        `.${expand} > span[aria-label=${payload.name}]:nth-child(${payload.index + 1})`
      )!
    )
  })

  const create = (menu: MenuBar) => {
    const { name, icon, children } = menu
    let $menu: string = ''
    const $button = `
    <button aria-label="${name}" class="${iconCls} ${!icon ? '--text' : ''}" type="button">
      ${icon || name}
    </button>`

    if (menu.children) {
      $menu = `
      <div class="${dropdown} ${dropdownHoverable}" aria-label="${name}">
        ${$button}
        <div class=${expand}>
          ${children
            .map(
              (it, i) =>
                `<span aria-label="${name}" class=${dropItem} data-selected=${Boolean(
                  it.default
                )} data-index=${i}>
                  ${it.name}
                </span>`
            )
            .join('')}
          </div>
      </div>
      `
    } else {
      $menu = $button
    }

    menus.push(menu)
    $bar.insertAdjacentHTML('afterbegin', $menu)
  }
}
