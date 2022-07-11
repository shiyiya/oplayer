import { hashify } from './hash'
import { mergeDeep } from './index'

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

function build(
  selector: string,
  { rules, mediaQuery }: { rules: Record<string, any>; mediaQuery: string | undefined }
) {
  let css: any = {}
  Object.keys(rules)?.forEach((key) => {
    if (isSelector(key)) {
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
        css[selector] ??= {}
        css[selector][key] = rules[key]
      }
    }
  })

  return css
}

function styleString(style: Record<string, any>): string[] {
  let str = []
  for (const key in style) {
    if (Object.hasOwnProperty.call(style, key)) {
      const element = style[key]
      if (isMediaQuery(key)) {
        str.push(`${key}{${styleString(element)}}`)
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

export function css(
  css: Record<string, any>,
  selector: string = '.css-' + hashify(JSON.stringify(css))
) {
  return styleString(build(selector, { rules: css, mediaQuery: undefined }))
}
