import { hashify } from './hash'
import { css as _css, DeepCssObject } from './css'

export namespace $ {
  export const create = <K extends keyof HTMLElementTagNameMap>(
    t: K | `${K}.${string}`,
    attrs: Record<string, string | boolean | number | undefined> = {},
    tpl: string = ''
  ): HTMLElementTagNameMap[K] => {
    const isIdSelector = t.indexOf('#') !== -1
    const isClassSelector = t.indexOf('.') !== -1
    const [tag, selector] = isIdSelector ? t.split('#') : isClassSelector ? t.split('.') : [t]
    const dom = document.createElement(tag as keyof HTMLElementTagNameMap)
    if (isIdSelector) dom.id = selector!
    if (isClassSelector) dom.classList.add(selector!)
    tpl && (dom.innerHTML = tpl)
    Object.keys(attrs).forEach((key) => {
      const attr = attrs[key]
      if ((tag === 'video' || tag === 'audio') && typeof attr === 'boolean') {
        attr && dom.setAttribute(key, '')
      } else {
        if (typeof attr !== 'undefined') {
          dom.setAttribute(key, `${attr}`)
        }
      }
    })
    return dom as HTMLElementTagNameMap[K]
  }

  export const render = <T extends Element>(elm: T, container: HTMLElement): T => {
    return container.appendChild(elm)
  }

  // export const renderHTML = (elm: string, container: HTMLElement) => {
  //   container.insertAdjacentHTML('beforeend', String(elm))
  //   return container.lastElementChild || container.lastChild
  // }

  export const isBrowser = () =>
    Boolean(
      typeof globalThis !== 'undefined' &&
        globalThis.document &&
        globalThis.document.documentElement
    )

  export function createSheet(key: string) {
    if (!isBrowser()) return null
    let tag = document.createElement('style')
    tag.setAttribute(`data-${key}`, '')
    tag.appendChild(document.createTextNode(''))
    ;(document.head || document.getElementsByTagName('head')[0]).appendChild(tag)

    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i]!.ownerNode === tag) {
        return document.styleSheets.item(i)
      }
    }
    return null
  }

  const createSelector = (() => {
    const cachedCss: Record<string, string> = Object.create({})
    return (s: string | Record<string, any>): string => {
      const key = typeof s == 'object' ? JSON.stringify(s) : s

      if (!cachedCss[key]) {
        cachedCss[key] = 'css-' + hashify(key)
      }

      return cachedCss[key]!
    }
  })()

  export const createCss =
    ({ sheet, ssrData }: { sheet: CSSStyleSheet | null; ssrData: string[] }) =>
    (...arg: [DeepCssObject] | [string] | any[]) => {
      const isRaw = Boolean(arg[0] && arg[0].length && arg[0].raw)

      let stringify = ''
      if (isRaw) {
        //css``
        let strings = arg[0]
        stringify += strings[0]
        for (let i = 1; i < arg.length; i++) {
          stringify += typeof arg[i] !== 'string' ? '' : arg[i]
          stringify += strings[i]
        }
      } else if (typeof arg[0] == 'string') {
        //css('')
        stringify = arg[0]
      } else {
        //css({})
        stringify = JSON.stringify(arg[0])
      }

      const cls = createSelector(stringify)

      if (sheet) {
        for (let i = 0; i < sheet.cssRules.length; i++) {
          if ((sheet.cssRules[i] as CSSStyleRule)?.selectorText == '.' + cls) {
            return cls
          }
        }
      }

      let styles = [`.${cls}{${stringify}}`]
      if (!isRaw && typeof arg[0] == 'object') {
        styles = _css(arg[0], `.${cls}`)
      }

      if (sheet) {
        styles.forEach((rule) => {
          sheet.insertRule(rule, sheet.cssRules.length)
        })
      } else {
        ssrData = ssrData.concat(styles)
      }

      return cls
    }

  export const createStyled = () => {
    const ssrData: string[] = []
    const sheet = createSheet('oplayer')

    return {
      css: createCss({ sheet, ssrData }),
      getCssValue: () => ssrData
    }
  }

  //TODO: support ssr
  export const { css, getCssValue } = createStyled()

  export const cls = (str: string) => 'css-' + hashify(str)
}

export default $
