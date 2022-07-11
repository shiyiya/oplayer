import hash, { hashify } from './hash'
import { css as _css } from './css'

export namespace $ {
  export const create = <T = HTMLElement>(
    t: string = 'div',
    attrs: Record<string, string | boolean | number | undefined> = {},
    tpl: string = ''
  ) => {
    const isIdSelector = t.indexOf('#') !== -1
    const isClassSelector = t.indexOf('.') !== -1
    const [tag, selector] = isIdSelector ? t.split('#') : isClassSelector ? t.split('.') : [t]
    const dom = document.createElement(tag as keyof HTMLElementTagNameMap)
    if (isIdSelector) dom.id = selector!
    if (isClassSelector) dom.classList.add(selector!)
    tpl && (dom.innerHTML = tpl)
    Object.keys(attrs).forEach((key) => {
      const attr = attrs[key]
      if (tag === 'video' && attr) {
        dom.setAttribute(key, `${attr}`)
      } else {
        if (typeof attr !== 'undefined') {
          dom.setAttribute(key, `${attr}`)
        }
      }
    })
    return dom as unknown as T
  }

  export const style = (elm: HTMLElement, name: keyof CSSStyleDeclaration, value: string) => {
    const style = elm.style
    style.setProperty(name as string, value)
  }

  export const render = (elm: HTMLElement, container: HTMLElement) => {
    return container.appendChild(elm)
  }

  function makeStyleTag() {
    let tag = document.createElement('style')
    tag.setAttribute('data-oplayer', '')
    tag.appendChild(document.createTextNode(''))
    ;(document.head || document.getElementsByTagName('head')[0]).appendChild(tag)

    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i]!.ownerNode === tag) {
        return document.styleSheets[i]
      }
    }
    return null
  }

  export const css = (() => {
    const sheet = makeStyleTag()!
    return (...rules: any[]) => {
      const isRaw = typeof rules[0] === 'string'
      const className = `.css-${isRaw ? hash(rules[0]).toString(36) : hashify(rules[0])}`

      for (let i = 0; i < sheet.cssRules.length; i++) {
        if ((sheet.cssRules[i] as CSSStyleRule)?.selectorText == className) {
          return className.substring(1)
        }
      }

      const strRules: string[] = isRaw ? [`${className}{${rules[0]}}`] : _css(rules[0], className)

      strRules.forEach((rule) => {
        sheet?.insertRule(rule, sheet.cssRules.length)
      })

      return className.substring(1)
    }
  })()
}

export default $
