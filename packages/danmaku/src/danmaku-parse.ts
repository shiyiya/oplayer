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
  return Array.from(matches).reduce<Comment[]>((initialValue, match) => {
    const p = match.groups?.['p']?.split(',')
    let text = match.groups?.['text']?.trim()

    if (p && p.length >= 8 && text) {
      const modeId = Number(p[1])
      const style: CSSStyleDeclaration = {
        fontSize: `${Number(p[2])}px`,
        color: `#${Number(p[3]).toString(16)}`,
        textShadow:
          'rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px',
        fontFamily: 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif'
      } as any

      // 高级弹幕
      // <d p="168.11800,7,36,16777215,1597152805,0,130cb53f,36705733621841927,10">[0,0,"1-1",4.5,"天气之子\n天气之子\n天气之子",0,0,0,0,500,0,1,"SimHei",1]</d>
      if (modeId >= 7) {
        const styledText = JSON.parse(text)
        text = styledText[4]
        if (styledText[12]) style.fontFamily = styledText[12]

        if (modeId == 7) {
          style.position = 'absolute'
          style.left = styledText[0]
          style.right = styledText[1]
        } else {
          if (styledText[5])
            style.transform = `rotateY(${styledText[5]}deg) rotateZ(${styledText[6]}deg)`
          //TODO: 动画弹幕
        }
      }

      return initialValue.concat({
        mode: getMode(modeId),
        text: text!
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&') as string,
        time: Number(p[0]),
        style
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
