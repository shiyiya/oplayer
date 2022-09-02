import type { RootRect } from './types'

//TODO: 全屏/弹幕少 优先行占满或做多几条
/**
 * @目前全屏或弹幕少展示这样
 *  --
 *    ----
 *        --
 *          ----
 *
 * @期望
 *  -- -- -- --
 *  --  --
 *
 *
 */
export default function getDanmaTop({
  target,
  emits,
  clientWidth,
  clientHeight,
  marginBottom,
  marginTop,
  antiOverlap
}: RootRect): number {
  const danmas = emits
    .filter((item) => item.mode === target.mode && item.top <= clientHeight - marginBottom)
    .sort((prev, next) => prev.top - next.top)

  if (danmas.length === 0) return marginTop

  danmas.unshift({
    top: 0,
    left: 0,
    right: 0,
    height: marginTop,
    width: clientWidth,
    speed: 0,
    distance: clientWidth
  })

  danmas.push({
    top: clientHeight - marginBottom,
    left: 0,
    right: 0,
    height: marginBottom,
    width: clientWidth,
    speed: 0,
    distance: clientWidth
  })

  for (let index = 1; index < danmas.length; index += 1) {
    const item = danmas[index]!
    const prev = danmas[index - 1]!
    const prevBottom = prev.top + prev.height
    const diff = item.top - prevBottom
    if (diff >= target.height) {
      return prevBottom
    }
  }

  const topMap: RootRect['emits'][] = []
  for (let index = 1; index < danmas.length - 1; index += 1) {
    const item = danmas[index]!
    if (topMap.length) {
      const last = topMap[topMap.length - 1]!
      if (last[0]!.top === item.top) {
        last.push(item)
      } else {
        topMap.push([item])
      }
    } else {
      topMap.push([item])
    }
  }

  if (antiOverlap) {
    switch (target.mode) {
      case 0: {
        const result = topMap.findIndex((list) => {
          for (let i = 0; i < list.length; i++) {
            const danma = list[i]!
            if (clientWidth < danma.distance) return false
            if (target.speed < danma.speed) continue
            const overlapTime = danma.right / (target.speed - danma.speed)
            if (overlapTime > danma.time!) continue
            return false
          }
          return true
        })
        return result !== -1 && topMap[result]?.[0] ? topMap[result]![0]!.top : -1
      }
      case 1:
        return -1
      default:
        return -1
    }
  } else {
    switch (target.mode) {
      case 0:
        topMap.sort((prev, next) => {
          const nextMinRight = Math.min(...next.map((item) => item.right))
          const prevMinRight = Math.min(...prev.map((item) => item.right))
          return nextMinRight * next.length - prevMinRight * prev.length
        })
        break
      case 1:
        topMap.sort((prev, next) => {
          const nextMaxWidth = Math.max(...next.map((item) => item.width))
          const prevMaxWidth = Math.max(...prev.map((item) => item.width))
          return prevMaxWidth * prev.length - nextMaxWidth * next.length
        })
        break
      default:
        break
    }

    return topMap[0]?.[0]?.top || -1
  }
}
