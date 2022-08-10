import { bilibiliDanmuParseFromUrl } from './bilibili-parse'
import getDanmuTop from './top'

import Player, { $ } from '@oplayer/core'
import DanmukuWorker from './danmuku.worker?worker&inline'
import type { ActiveDanmukuRect, DanmukuItem, Options, QueueItem, _Options } from './types'

const danmukuItemCls = $.css`
  position: absolute;
  white-space: pre;
  pointer-events: none;
  perspective: 500px;
  will-change: transform, top;
  line-height: 1.125;
  text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px;
`

export default class Danmuku {
  $player: HTMLDivElement
  $danmuku: HTMLDivElement
  options: _Options

  isStop: boolean = false
  isHide: boolean = false
  timer: number | null = null
  queue: QueueItem[] = []
  $refs: HTMLDivElement[] = []
  worker: Worker

  constructor(public player: Player, options: Options) {
    this.$player = player.$root as HTMLDivElement
    this.$danmuku = $.create(
      `div.${$.css`width: 100%; height: 100%; position: absolute; left: 0; top: 0; pointer-events: none;`}`
    )
    this.options = Object.assign(
      {
        speed: 5,
        color: '#fff',
        mode: 0,
        margin: [2, 2],
        antiOverlap: true,
        useWorker: true,
        synchronousPlayback: true
      },
      options
    )

    if (options.useWorker) {
      this.worker = new DanmukuWorker()
      this.worker.addEventListener('error', (error) => {
        player.emit('notice', 'danmuku-worker:' + error.message)
      })
    }

    player.on(['play', 'playing'], this.start.bind(this))
    player.on(['pause', 'waiting'], this.stop.bind(this))
    player.on(['fullscreen', 'webfullscreen', 'seeking'], this.reset.bind(this))
    player.on('destroy', this.destroy.bind(this))

    this.fetch()
    $.render(this.$danmuku, this.$player)
  }

  async fetch() {
    try {
      let danmukus: DanmukuItem[] = []
      if (typeof this.options.danmuku === 'function') {
        danmukus = await this.options.danmuku()
      } else if (typeof this.options.danmuku === 'string') {
        danmukus = await bilibiliDanmuParseFromUrl(this.options.danmuku)
      } else {
        danmukus = this.options.danmuku
      }
      this.player.emit('danmukuloaded', danmukus)
      this.load(danmukus)
    } catch (error) {
      this.player.emit('notice', { text: 'danmuku: ' + (<Error>error).message })
      throw error
    }
  }

  load(danmukus: DanmukuItem[]) {
    this.queue = []
    this.$danmuku.innerHTML = ''

    danmukus
      .sort((a, b) => a.time - b.time)
      .forEach((danmuku) => {
        if (this.options?.filter && this.options.filter(danmuku)) return

        this.queue.push({
          color: this.options.color,
          status: 'wait',
          $ref: null,
          restTime: 0,
          lastTime: 0,
          ...danmuku
        })
      })
  }

  start() {
    this.isStop = false
    this.continue()
    this.update()
    this.player.emit('danmuku:start')
  }

  update() {
    this.timer = window.requestAnimationFrame(async () => {
      if (this.player.isPlaying && !this.isHide && this.queue.length) {
        this.mapping('emit', (danmu) => {
          danmu.restTime -= (Date.now() - danmu.lastTime) / 1000
          danmu.lastTime = Date.now()
          if (danmu.restTime <= 0) {
            this.makeWait(danmu)
          }
        })

        const readys = this.getReady()
        const { clientWidth, clientHeight } = this.$player

        for (let index = 0; index < readys.length; index++) {
          const danmu = readys[index]!
          danmu.$ref = this.createItem({
            text: danmu.text,
            cssText: `left: ${clientWidth}px;
            ${this.options.opacity ? `opacity: ${this.options.opacity};` : ''}
            ${this.options.fontSize ? `font-size: ${this.options.fontSize}px;` : ''}

            ${danmu.color ? `color: ${danmu.color};` : ''},
            ${this.options.fontSize ? `font-size: ${this.options.fontSize}px;` : ''}
            ${
              danmu.border
                ? `border: 1px solid ${danmu.color}; background-color: rgb(0 0 0 / 50%);`
                : ''
            }`
          })
          this.$danmuku.appendChild(danmu.$ref)

          danmu.lastTime = Date.now()
          danmu.restTime =
            this.options.synchronousPlayback && this.player.playbackRate
              ? this.options.speed / this.player.playbackRate
              : this.options.speed

          const rect = this.getActiveDanmukusBoundingClientRect()
          const target = {
            mode: danmu.mode,
            height: danmu.$ref.clientHeight,
            speed: (clientWidth + danmu.$ref.clientWidth) / danmu.restTime
          }

          await this.postMessage({
            target,
            emits: rect,
            clientWidth,
            clientHeight,
            antiOverlap: this.options.antiOverlap,
            marginTop: this.options.margin?.[0] || 0,
            marginBottom: this.options.margin?.[1] || 50
          }).then(({ top }) => {
            if (!this.isStop && top != -1) {
              danmu.status = 'emit'
              danmu.$ref!.style.opacity = '1'
              danmu.$ref!.style.top = `${top}px`

              switch (danmu.mode) {
                case 0: {
                  const translateX = clientWidth + danmu.$ref!.clientWidth
                  danmu.$ref!.style.transform = `translate3d(${-translateX}px, 0, 0)`
                  danmu.$ref!.style.transition = `transform ${danmu.restTime}s linear 0s`
                  break
                }
                case 1:
                  danmu.$ref!.style.left = '50%'
                  danmu.$ref!.style.transform = 'translate3d(-50%, 0, 0)'
                  break
                default:
                  break
              }
            } else {
              danmu.status = 'ready'
              this.$refs.push(danmu.$ref!)
              danmu.$ref = null
            }
          })
        }

        if (!this.isStop) this.update()
      }
    })
  }

  continue() {
    const { clientWidth } = this.$player
    this.mapping('stop', (danmu) => {
      danmu.status = 'emit'
      danmu.lastTime = Date.now()
      switch (danmu.mode) {
        case 0: {
          const translateX = clientWidth + danmu.$ref!.clientWidth
          danmu.$ref!.style.transform = `translate3d(${-translateX}px, 0, 0)`
          danmu.$ref!.style.transition = `transform ${danmu.restTime}s linear 0s`
          break
        }
        default:
          break
      }
    })
  }

  suspend() {
    const { clientWidth } = this.$player
    this.mapping('emit', (danmu) => {
      danmu.status = 'stop'
      switch (danmu.mode) {
        case 0: {
          const translateX = clientWidth - (this.getLeft(danmu.$ref!) - this.getLeft(this.$player))
          danmu.$ref!.style.transform = `translate3d(${-translateX}px, 0, 0)`
          danmu.$ref!.style.transition = 'transform 0s linear 0s'
          break
        }
        default:
          break
      }
    })
  }

  mapping(status: string, callback: (d: QueueItem) => void) {
    this.queue.forEach((danmu) => danmu.status === status && callback(danmu))
  }

  getLeft($ref: HTMLElement) {
    return $ref.getBoundingClientRect().left
  }

  createItem({ text, cssText }: { text: string; cssText: string }): HTMLDivElement {
    const $cache = this.$refs.pop()
    if ($cache) return $cache

    const $ref = document.createElement('div')
    $ref.className = danmukuItemCls
    $ref.innerText = text
    $ref.style.cssText = cssText
    return $ref as HTMLDivElement
  }

  getReady() {
    const { currentTime } = this.player
    return this.queue.filter((danmu) => {
      return (
        danmu.status === 'ready' ||
        (danmu.status === 'wait' &&
          currentTime + 0.1 >= danmu.time &&
          danmu.time >= currentTime - 0.1)
      )
    })
  }

  getActiveDanmukusBoundingClientRect() {
    const result: ActiveDanmukuRect[] = []
    const { clientWidth } = this.$player
    const clientLeft = this.getLeft(this.$player)

    this.mapping('emit', (danmu) => {
      const top = danmu.$ref!.offsetTop
      const left = this.getLeft(danmu.$ref!) - clientLeft
      const height = danmu.$ref!.clientHeight
      const width = danmu.$ref!.clientWidth
      const distance = left + width
      const right = clientWidth - distance
      const speed = distance / danmu.restTime

      result.push({
        top,
        left,
        height,
        width,
        right,
        speed,
        distance,
        time: danmu.restTime,
        mode: danmu.mode
      })
    })

    return result
  }

  postMessage(message = {} as any): Promise<{ top: number }> {
    return new Promise((resolve) => {
      if (this.options.useWorker && this.worker && this.worker.postMessage) {
        message.id = Date.now()
        this.worker.onmessage = ({ data }) => {
          if (data.id === message.id) resolve(data)
        }
        this.worker.postMessage(message)
      } else {
        const top = getDanmuTop(message)
        resolve({ top })
      }
    })
  }

  makeWait(danmu: QueueItem) {
    danmu.status = 'wait'
    if (danmu.$ref) {
      danmu.$ref.style.opacity = '0'
      danmu.$ref.style.transform = 'translate3d(0, 0, 0)'
      danmu.$ref.style.transition = 'transform 0s linear 0s'
      this.$refs.push(danmu.$ref)
      danmu.$ref = null
    }
  }

  reset() {
    this.queue.forEach((danmu) => this.makeWait(danmu))
  }

  emit(danmu: DanmukuItem) {
    this.queue.push({
      ...danmu,
      status: 'wait',
      $ref: null,
      restTime: 0,
      lastTime: 0
    })
  }

  stop() {
    this.isStop = true
    this.suspend()
    window.cancelAnimationFrame(this.timer!)
    this.player.emit('danmuku')
  }

  show() {
    this.isHide = false
    this.start()
    this.$danmuku.style.display = 'block'
    this.player.emit('danmuku:show')
  }

  hide() {
    this.isHide = true
    this.stop()
    this.queue.forEach((item) => this.makeWait(item))
    this.$danmuku.style.display = 'none'
    this.player.emit('danmuku:hide')
  }

  destroy() {
    this.stop()
    this.worker?.terminate?.()
    this.player.emit('danmuku:destroy')
  }
}
