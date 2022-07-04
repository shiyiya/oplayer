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

  export const css = (...rules: any[]) => {
    if (!(rules[0] && rules[0].length && rules[0].raw)) {
      throw new Error('Not yet implemented')
    }

    let styles = ''
    let strings = rules[0]
    styles += strings[0]
    for (let i = 1; i < rules.length; i++) {
      styles += typeof rules[i] == 'boolean' ? '' : rules[i]
      styles += strings[i]
    }

    const className = `css-${S5()}`
    render(
      $.create('style', {}, `.${className}{${styles}}`),
      document.getElementsByTagName('head')[0]!
    )
    return className
  }
}

export function S5() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16)
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
