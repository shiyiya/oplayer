import { hashify } from './hash'
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

  const cachedCss = new WeakMap()

  export const css = (() => {
    const sheet = makeStyleTag()!
    return (...arg: any[]) => {
      const isRaw = arg[0] && arg[0].length && arg[0].raw
      const cssString: string[] = isRaw ? arg[0].raw : [arg[0]]
      let className: string

      if (cachedCss.has(cssString)) {
        className = cachedCss.get(cssString)
      } else {
        className = `.css-${hashify(cssString)}`
        cachedCss.set(cssString, className)
      }

      for (let i = 0; i < sheet.cssRules.length; i++) {
        if ((sheet.cssRules[i] as CSSStyleRule)?.selectorText == className) {
          return className.substring(1)
        }
      }

      let styles: string | Array<string> = ''
      if (isRaw) {
        //css``
        let strings = arg[0]
        styles += strings[0]
        for (let i = 1; i < arg.length; i++) {
          styles += typeof arg[i] !== 'string' ? '' : arg[i]
        }
        styles = [`${className}{${styles}}`]
      } else if (typeof arg[0] == 'string') {
        //css('')
        styles = [`${className}{${arg[0]}}`]
      } else {
        //css({})
        styles = _css(arg[0], className)
      }

      styles.forEach((rule) => {
        sheet?.insertRule(rule, sheet.cssRules.length)
      })

      return className.substring(1)
    }
  })()
}

export default $
