import { $, Player } from '@oplayer/core'
import type { DanmakuContext, Options } from './types'

const lib = {
  map(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  },
  range(start: number, end: number, tick: number) {
    const s = Math.round(start / tick) * tick
    return Array.from(
      {
        length: Math.floor((end - start) / tick)
      },
      (_, k) => {
        return k * tick + s
      }
    )
  }
}

const line = (pointA: number[], pointB: number[]) => {
  const lengthX = pointB[0]! - pointA[0]!
  const lengthY = pointB[1]! - pointA[1]!
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

export default class Heatmap {
  $root: HTMLDivElement
  $start?: HTMLDivElement
  $stop?: HTMLDivElement

  loaded: boolean = false

  constructor(
    public player: Player,
    public danmaku: DanmakuContext,
    public heatmap: boolean,
    public customHeatmap?: Options['customHeatmap']
  ) {
    if(!player.context.ui.$progress) return
    const $progress = player.context.ui.$progress.firstElementChild
    const $root = document.createElement('div')
    this.$root = $root
    $root.style.cssText = 'position:absolute;bottom:0.33em;height: 8em;width:100%;pointer-events:none;'
    $progress.insertBefore($root, $progress.firstChild)

    if (heatmap && (danmaku.comments.length || customHeatmap?.length)) {
      this.renderHeatmap()
      this.enable()
    }

    player.on('videosourcechange', () => {
      this.disable()
      this.loaded = false
      this.customHeatmap = []
      this.$root.innerHTML = ''
      player.off('timeupdate', this._update)
      player.off('seeked', this._update)
    })
  }

  _update = () => {
    const { player, $start, $stop } = this
    $start?.setAttribute('offset', `${(player.currentTime / player.duration) * 100}%`)
    $stop?.setAttribute('offset', `${(player.currentTime / player.duration) * 100}%`)
  }

  enable(customHeatmap?: Options['customHeatmap']) {
    if (customHeatmap) this.customHeatmap = customHeatmap
    const { player, $root } = this
    $root.style.display = 'block'

    if (!this.loaded) {
      if (isNaN(player.duration)) {
        player.on('metadataloaded', () => {
          this.renderHeatmap()
        })
      } else {
        this.renderHeatmap()
      }
    }

    player.on(['timeupdate', 'seeked'], this._update)
  }

  disable() {
    const { player, $root } = this
    $root.style.display = 'none'
    player.off('timeupdate', this._update)
    player.off('seeked', this._update)
  }

  renderHeatmap() {
    const { player, customHeatmap: customHeatmap, danmaku, $root } = this
    if (!this.heatmap || !(danmaku.comments.length || customHeatmap?.length)) {
      return
    }

    this.loaded = true

    const { offsetHeight: h, offsetWidth: w } = $root

    const options = {
      xMin: 0,
      xMax: w,
      yMin: 0,
      yMax: 128,
      scale: 0.25,
      opacity: 0.5,
      minHeight: Math.floor(h * 0.05),
      sampling: Math.floor(w / 100),
      fill: 'rgba(255, 255, 255, 0.5)',
      smoothing: 0.2,
      flattening: 0.2
    }

    type Point = [number, number]
    const points: Point[] = Array.isArray(customHeatmap) ? customHeatmap : []

    if (!points.length) {
      const gap = player.duration / w
      for (let x = 0; x <= w; x += options.sampling) {
        const y = danmaku.comments.filter(
          ({ time }) => !!time && time > x * gap && time <= (x + options.sampling) * gap
        ).length
        points.push([x, y])
      }
    }

    const [lastX, lastY] = points[points.length - 1]!
    if (lastX !== w) {
      points.push([w, lastY])
    }

    const yPoints = points.map((point) => point[1]!)
    const yMin = Math.min(...yPoints)
    const yMax = Math.max(...yPoints)
    const yMid = (yMin + yMax) / 2

    for (let i = 0; i < points.length; i++) {
      const point = points[i]!
      const y = point[1]!
      point[1] = y * (y > yMid ? 1 + options.scale : 1 - options.scale) + options.minHeight
    }

    const controlPoint = (current: any, previous: any, next: any, reverse?: any) => {
      const p = previous || current
      const n = next || current
      const o = line(p, n)
      const flat = lib.map(Math.cos(o.angle) * options.flattening, 0, 1, 1, 0)
      const angle = o.angle * flat + (reverse ? Math.PI : 0)
      const length = o.length * options.smoothing
      const x = current[0] + Math.cos(angle) * length
      const y = current[1] + Math.sin(angle) * length
      return [x, y]
    }

    const bezierCommand = (point: any, i: any, a: any) => {
      const cps = controlPoint(a[i - 1], a[i - 2], point)
      const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
      const close = i === a.length - 1 ? ' z' : ''
      return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}${close}`
    }

    const pointsPositions = points.map((e: any) => {
      const x = lib.map(e[0], options.xMin, options.xMax, 0, w)
      const y = lib.map(e[1], options.yMin, options.yMax, h, 0)
      return [x, y]
    })

    const pathD = pointsPositions.reduce(
      (acc, e, i, a) =>
        i === 0
          ? `M ${a[a.length - 1]![0]},${h} L ${e[0]},${h} L ${e[0]},${e[1]}`
          : `${acc} ${bezierCommand(e, i, a)}`,
      ''
    )

    const pa = $.css({
      position: 'absolute',
      bottom: 0,
      [`@global [data-ctrl-hidden=true] &`]: {
        opacity: 0,
        transition: 'opacity .3s'
      }
    })

    $root.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="${pa}">
        <defs>
            <linearGradient id="heatmap-solids" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:var(--primary-color); stop-opacity:${options.opacity}" />
                <stop offset="0%" style="stop-color:var(--primary-color); stop-opacity:${options.opacity}" id="heatmap-start" />
                <stop offset="0%" style="stop-color:var(--heatmap-color, ${options.fill});" id="heatmap-stop" />
                <stop offset="100%" style="stop-color:var(--heatmap-color, ${options.fill});" />
            </linearGradient>
        </defs>
        <path fill="url(#heatmap-solids)" d="${pathD}"></path>
    </svg>
  `

    this.$start = $root.querySelector('#heatmap-start')!
    this.$stop = $root.querySelector('#heatmap-stop')!
  }
}
