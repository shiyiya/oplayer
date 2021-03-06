import hash from './hash'
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
      if (tag === 'video' || tag === 'audio') {
        attr && dom.setAttribute(key, `${attr}`)
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

  const createSelector = (() => {
    const cachedCss: Record<string, string> = Object.create({})
    return (s: string | Record<string, any>): string => {
      const key = typeof s == 'object' ? JSON.stringify(s) : s

      if (!cachedCss[key]) {
        cachedCss[key] = 'css-' + hash(key).toString(36)
      }

      return cachedCss[key]!
    }
  })()

  export const css = (() => {
    const sheet = makeStyleTag()!
    return (...arg: any[]) => {
      const isRaw = arg[0] && arg[0].length && arg[0].raw

      let stringify = ''
      if (isRaw) {
        //css``
        stringify = arg.slice(1).reduce((p, c) => (p + typeof c !== 'string' ? '' : c), arg[0][0])
      } else if (typeof arg[0] == 'string') {
        //css('')
        stringify = arg[0]
      } else {
        //css({})
        stringify = JSON.stringify(arg[0])
      }

      const cls = createSelector(stringify)
      for (let i = 0; i < sheet.cssRules.length; i++) {
        if ((sheet.cssRules[i] as CSSStyleRule)?.selectorText == '.' + cls) {
          return cls
        }
      }

      let styles = [`.${cls}{${stringify}}`]
      if (!isRaw && typeof arg[0] == 'object') {
        styles = _css(arg[0], `.${cls}`)
      }

      styles.forEach((rule) => {
        sheet?.insertRule(rule, sheet.cssRules.length)
      })

      return cls
    }
  })()
}

export default $
