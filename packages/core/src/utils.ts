import hash from './hash'

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
      if (rules[0] && !rules.length && typeof rules === 'object') {
        throw new Error('Not yet implemented')
      }

      const className = `css-${hash(rules[0]).toString(36)}`
      for (let i = 0; i < sheet.cssRules.length; i++) {
        if ((sheet.cssRules[i] as CSSStyleRule)?.selectorText == className) {
          return className
        }
      }
      sheet?.insertRule(`.${className}{${rules[0]}}`, sheet.cssRules.length)
      return className
    }
  })()
}

export function padZero(time: number): string {
  return time < 10 ? `0${time}` : `${time}`
}

export function formatTime(duration: number): string {
  if (!isFinite(duration)) return '--:--'
  const h = Math.floor(duration / 3600)
  const m = Math.floor((duration % 3600) / 60)
  const s = Math.floor((duration % 3600) % 60)
  return `${h > 0 ? `${padZero(h)}:` : ''}${padZero(m)}:${padZero(s)}`
}

export const isMobile = /Android|webOS|iPhone|Pad|Pod|BlackBerry|Windows Phone/i.test(
  navigator.userAgent
)
