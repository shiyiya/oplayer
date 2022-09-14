import { mergeDeep, isObject } from './index'

function isSelector(key: string) {
  let possibles = [':', '.', '[', '>', ' '],
    found = false,
    ch = key.charAt(0)
  for (let i = 0; i < possibles.length; i++) {
    if (ch === possibles[i]) {
      found = true
      break
    }
  }
  return found || key.indexOf('&') >= 0
}

var selectorTokenizer = /[(),]|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|\/\*[\s\S]*?\*\//g

function splitSelector(selector: string) {
  if (selector.indexOf(',') === -1) {
    return [selector]
  }

  var indices = [],
    res = [],
    inParen = 0,
    o
  while ((o = selectorTokenizer.exec(selector))) {
    switch (o[0]) {
      case '(':
        inParen++
        break
      case ')':
        inParen--
        break
      case ',':
        if (inParen) break
        indices.push(o.index)
    }
  }
  for (o = indices.length; o--; ) {
    res.unshift(selector.slice(indices[o]! + 1))
    selector = selector.slice(0, indices[o])
  }
  res.unshift(selector)
  return res
}

function joinSelectors(a: string, b: string) {
  let as = splitSelector(a)
  let bs = splitSelector(b).map((b) => (!(b.indexOf('&') >= 0) ? '&' + b : b))

  return bs.reduce((arr, b) => arr.concat(as.map((a) => b.replace(/\&/g, a)) as any), []).join(',')
}

function joinMediaQueries(a: string | undefined, b: string) {
  return a ? `@media ${a.substring(6)} and ${b.substring(6)}` : b
}

function isMediaQuery(key: string) {
  return key.indexOf('@media') === 0
}

function isKeyframes(key: string) {
  return key.indexOf('@keyframes') === 0
}

function isGlobal(key: string) {
  return key.indexOf('@global') === 0
}

function build(
  selector: string,
  {
    rules,
    mediaQuery,
    globalSelector
  }: { rules: Record<string, any>; mediaQuery?: string; globalSelector?: string }
) {
  let css: any = {}

  if (globalSelector) selector = globalSelector

  Object.keys(rules)?.forEach((key) => {
    if (isGlobal(key)) {
      const rawKey = key
      key = key.substring(8)
      const selfKey = key.indexOf('&')
      let _selector

      if (selfKey != -1) {
        //只能 @global .xxx & :{} & 为当前整个的selector .xxx 为global
        _selector = joinSelectors(selector, key)
        globalSelector = key.substring(0, selfKey - 1).trim()
      } else {
        // @global .xxx{ &:{} } &为.xxx
        _selector = key
      }

      mergeDeep(
        css,
        build(_selector, {
          mediaQuery: mediaQuery,
          rules: rules[rawKey],
          globalSelector: _selector
        })
      )
    } else if (isSelector(key)) {
      mergeDeep(
        css,
        build(joinSelectors(selector, key), {
          rules: rules[key],
          mediaQuery
        })
      )
    } else if (isMediaQuery(key)) {
      mergeDeep(
        css,
        build(selector, {
          mediaQuery: joinMediaQueries(mediaQuery, key),
          rules: rules[key]
        })
      )
    } else {
      if (mediaQuery) {
        css[mediaQuery] ??= {}
        css[mediaQuery][selector] ??= {}
        css[mediaQuery][selector][key] = rules[key]
      } else {
        if (isKeyframes(key)) {
          css[key] = rules[key]
        } else {
          css[selector] ??= {}
          css[selector][key] = rules[key]
        }
      }
    }
  })

  return css
}

function deepStyleString(style: Record<string, any>): string {
  let v = []
  for (const key in style) {
    if (Object.hasOwnProperty.call(style, key)) {
      const element = style[key]
      if (isObject(element)) {
        v.push(`${key}{${deepStyleString(element)}}`)
      } else {
        v.push(`${key}:${element}`)
      }
    }
  }

  //Keyframes
  //@keyframes indeterminate_first{
  //  0% { left: -100 % width: 100%} <!;>
  //  100% { left: 100 % width: 10%}
  //}

  return /^\d%/.test(v[0]!) ? v.join(' ') : v.join(';')
}

function styleString(style: Record<string, any>): string[] {
  let str = []
  for (const key in style) {
    if (Object.hasOwnProperty.call(style, key)) {
      const element = style[key]
      if (isMediaQuery(key)) {
        str.push(`${key}{${styleString(element)}}`)
      } else if (isKeyframes(key)) {
        str.push(`${key}{${deepStyleString(element)}}`)
      } else {
        const v = Object.entries(element)
          .map(([k, v]) => `${k}:${v}`)
          .join(';')
        str.push(`${key}{${v}}`)
      }
    }
  }

  return str
}

export function css(css: DeepCssObject, selector: string) {
  return styleString(build(selector, { rules: css }))
}

export type CssKey =
  | Tras<Extract<keyof CSSStyleDeclaration, string>>
  | `@media ${string}`
  | `@keyframes ${string}`
  | `@global${string}`

export type cssValue = string | number | boolean
export type CssObject = Record<CssKey, cssValue>

export type DeepCssObject = Record<CssKey, CssObject | cssValue>

export type Tras<T extends string, Rusult extends string = ''> = T extends `${infer L}${infer R}`
  ? L extends
      | 'Q'
      | 'W'
      | 'E'
      | 'R'
      | 'T'
      | 'Y'
      | 'U'
      | 'I'
      | 'O'
      | 'P'
      | 'A'
      | 'S'
      | 'D'
      | 'F'
      | 'G'
      | 'H'
      | 'J'
      | 'K'
      | 'L'
      | 'Z'
      | 'X'
      | 'C'
      | 'V'
      | 'B'
      | 'N'
      | 'M'
    ? Tras<R, `${Rusult}-${Lowercase<L>}`>
    : Tras<R, `${Rusult}${L}`>
  : `${Rusult}${T}`
