import { Comment } from './types'

// 1..3滚动弹幕 4底端弹幕 5顶端弹幕 6逆向弹幕 7精准定位 8高级弹幕
export function getMode(key: number): Comment['mode'] {
  switch (key) {
    case 1:
    case 2:
    case 3:
      return 'rtl'
    case 4:
      return 'bottom'
    case 5:
      return 'top'
    case 6:
      return 'ltr'
    case 7:
      return 'top'
    default:
      return 'top'
  }
}

// http://jabbany.github.io/CommentCoreLibrary/docs/data-formats/bilibili-xml.html
export function danmakuParseFromXml(xmlString: string) {
  const matches = xmlString.matchAll(/<d (?:.*? )??p="(?<p>.+?)"(?: .*?)?>(?<text>.+?)<\/d>/gs)
  const result: Comment[] = []
  Array.from(matches).forEach((match) => {
    const p = match.groups?.['p']?.split(',')
    let text = match.groups?.['text']?.trim()

    if (p && p.length >= 8 && text) {
      const modeId = Number(p[1])
      const style: CSSStyleDeclaration = {
        fontSize: `${Number(p[2])}px`,
        color: `#${Number(p[3]).toString(16)}`
      } as any

      if (modeId >= 7) {
        const styledText = JSON.parse(text)

        text = styledText[4]
        if (styledText[12]) style.fontFamily = styledText[12]

        if (modeId == 7) {
          style.position = 'absolute'
          style.left = `${styledText[0]}px`
          style.right = `${styledText[1]}px`
        } else {
          // TODO custom render
          // https://github.com/weizhenye/Danmaku
          // style.transform = `rotateZ(${styledText[5]}deg) rotateY(${styledText[6]}deg)`
        }
      }

      result.push({
        text,
        style,
        mode: getMode(Number(modeId)),
        time: Number(p[0])
      })
    }
  })
  return result
}

export function danmakuParseFromUrl(src: string) {
  return fetch(src)
    .then((res) => res.text())
    .then((xmlString) => danmakuParseFromXml(xmlString))
}
