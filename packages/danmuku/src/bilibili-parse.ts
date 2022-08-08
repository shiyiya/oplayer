import { DanmukuItem } from './types'

export function getMode(key: number) {
  switch (key) {
    case 1:
    case 2:
    case 3:
      return 0
    case 4:
    case 5:
      return 1
    default:
      return 0
  }
}

export function bilibiliDanmuParseFromXml(xmlString: string) {
  const matches = xmlString.matchAll(/<d (?:.*? )??p="(?<p>.+?)"(?: .*?)?>(?<text>.+?)<\/d>/gs)
  return Array.from(matches).reduce<DanmukuItem[]>((initialValue, match) => {
    const p = match.groups?.['p']?.split(',')
    const text = match.groups?.['text']?.trim()
    if (p && p.length >= 8 && text) {
      text
        ?.trim()
        .replaceAll('&quot;', '"')
        .replaceAll('&apos;', "'")
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')

      return initialValue.concat({
        text: text
          .trim()
          .replaceAll('&quot;', '"')
          .replaceAll('&apos;', "'")
          .replaceAll('&lt;', '<')
          .replaceAll('&gt;', '>')
          .replaceAll('&amp;', '&'),
        time: Number(p[0]),
        mode: getMode(Number(p[1])),
        fontSize: Number(p[2]),
        color: `#${Number(p[3]).toString(16)}`,
        timestamp: Number(p[4]),
        pool: Number(p[5]),
        userID: p[6]!,
        rowID: Number(p[7])
      })
    }
    return initialValue
  }, [])
}

export function bilibiliDanmuParseFromUrl(url: string) {
  return fetch(url)
    .then((res) => res.text())
    .then((xmlString) => bilibiliDanmuParseFromXml(xmlString))
}
