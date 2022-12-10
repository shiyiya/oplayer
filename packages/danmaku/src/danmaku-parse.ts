import { Comment } from './types'

export function getMode(key: number) {
  switch (key) {
    case 1:
    case 2:
    case 3:
      return 'rtl'
    case 4:
    case 5:
      return 'top'
    default:
      return 'top'
  }
}

export function danmakuParseFromXml(xmlString: string) {
  const matches = xmlString.matchAll(/<d (?:.*? )??p="(?<p>.+?)"(?: .*?)?>(?<text>.+?)<\/d>/gs)
  return Array.from(matches).reduce<Comment[]>((initialValue, match) => {
    const p = match.groups?.['p']?.split(',')
    const text = match.groups?.['text']?.trim()
    if (p && p.length >= 8 && text) {
      return initialValue.concat({
        text: text
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&') as string,
        time: Number(p[0]),
        mode: getMode(Number(p[1])),

        style: {
          fontSize: `${Number(p[2])}px`,
          color: `#${Number(p[3]).toString(16)}`
        }
      })
    }
    return initialValue
  }, [])
}

export function danmakuParseFromUrl(src: string) {
  return fetch(src)
    .then((res) => res.text())
    .then((xmlString) => danmakuParseFromXml(xmlString))
}
