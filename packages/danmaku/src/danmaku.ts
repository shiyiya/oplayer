import { danmakuParseFromUrl } from './danmaku-parse'
import getDanmaTop from './top'

import Player, { $ } from '@oplayer/core'
import DanmakuWorker from './danmaku.worker?worker&inline'
import type { ActiveDanmakuRect, DanmakuItem, Options, QueueItem, _Options } from './types'

const danmakuWrap = $.css(`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  font-family: SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif;
`)

const danmakuItemCls = $.css(`
  position: absolute;
  white-space: pre;
  pointer-events: none;
  perspective: 500px;
  will-change: transform, top;
  line-height: 1.125;
  text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) 0px -1px 1px, rgb(0 0 0) -1px 0px 1px;
`)

const danmakuCenter = $.css(`
  left: 50%;
  transform: translateX(-50%);
`)

/**
 * emit：正在滚动
 * ready：准备滚动
 * wait：等待重用
 * stop：暂停
 */
export default class Danmaku {
  $player: HTMLDivElement
  $danmaku: HTMLDivElement

  isStop: boolean = false
  isHide: boolean = false
  timer: number | null = null
  queue: QueueItem[] = []
  $refs: HTMLDivElement[] = []
  worker: Worker

  options: _Options

  constructor(private player: Player, options: Options) {
    this.$player = player.$root as HTMLDivElement
    this.$danmaku = $.render($.create(`div.${danmakuWrap}`), this.$player) as HTMLDivElement

    this.options = {
      speed: 5,
      color: '#fff',
      margin: [2, 2],
      antiOverlap: true,
      useWorker: true,
      synchronousPlayback: true,
      ...options
    }

    if (options.useWorker) {
      this.worker = new DanmakuWorker()
      this.worker.addEventListener('error', (error) => {
        player.emit('notice', 'danmaku-worker:' + error.message)
      })
    }

    this.fetch()
  }

  async fetch() {
    try {
      let danmakus: DanmakuItem[] = []
      if (typeof this.options.source === 'function') {
        danmakus = await this.options.source()
      } else if (typeof this.options.source === 'string') {
        danmakus = await danmakuParseFromUrl(this.options.source)
      } else {
        danmakus = this.options.source
      }
      this.player.emit('loadeddanmaku', danmakus)
      this.load(danmakus)
    } catch (error) {
      this.player.emit('notice', { text: 'danmaku: ' + (<Error>error).message })
      throw error
    }
  }

  load(danmakus: DanmakuItem[]) {
    this.queue = []
    this.$danmaku.innerHTML = ''

    danmakus.forEach((danmaku) => {
      if (this.options?.filter && this.options.filter(danmaku)) return

      this.queue.push({
        color: this.options.color,
        status: 'wait',
        $ref: null,
        restTime: 0,
        lastTime: 0,
        ...danmaku
      })
    })
  }

  start() {
    this.isStop = false
    this.continue()
    this.update()
    this.player.emit('danmaku:start')
  }

  update() {
    this.timer = window.requestAnimationFrame(async () => {
      if (this.player.isPlaying && !this.isHide && this.queue.length) {
        this.mapping('emit', (danmaku) => {
          danmaku.restTime -= (Date.now() - danmaku.lastTime) / 1000
          danmaku.lastTime = Date.now()
          if (danmaku.restTime <= 0) {
            this.makeWait(danmaku)
          }
        })

        const readys = this.getReady()
        const { clientWidth, clientHeight } = this.$player

        for (let index = 0; index < readys.length; index++) {
          const danmaku = readys[index]!
          danmaku.$ref = this.createItem({
            text: danmaku.text,
            cssText: `left: ${clientWidth}px;
            ${this.options.opacity ? `opacity: ${this.options.opacity};` : ''}
            ${this.options.fontSize ? `font-size: ${this.options.fontSize}px;` : ''}

            ${danmaku.color ? `color: ${danmaku.color};` : ''},
            ${
              danmaku.border
                ? `border: 1px solid ${danmaku.color}; background-color: rgb(0 0 0 / 50%);`
                : ''
            }`
          })
          this.$danmaku.appendChild(danmaku.$ref)

          danmaku.lastTime = Date.now()
          danmaku.restTime =
            this.options.synchronousPlayback && this.player.playbackRate
              ? this.options.speed / this.player.playbackRate
              : this.options.speed

          const rect = this.getActiveDanmakusBoundingClientRect()
          const target = {
            mode: danmaku.mode,
            height: danmaku.$ref.clientHeight,
            speed: (clientWidth + danmaku.$ref.clientWidth) / danmaku.restTime
          }

          const { top } = await this.postMessage({
            target,
            emits: rect,
            clientWidth,
            clientHeight,
            antiOverlap: this.options.antiOverlap,
            marginTop: this.options.margin[0],
            marginBottom: this.options.margin[1]
          })

          if (!this.isStop && top != -1) {
            danmaku.status = 'emit'
            danmaku.$ref.style.opacity = '1'
            danmaku.$ref.style.top = `${top}px`

            switch (danmaku.mode) {
              case 0: {
                const translateX = clientWidth + danmaku.$ref.clientWidth
                danmaku.$ref.style.transform = `translate3d(${-translateX}px, 0, 0)`
                danmaku.$ref.style.transition = `transform ${danmaku.restTime}s linear 0s`
                break
              }
              case 1:
                danmaku.$ref.classList.add(`.${danmakuCenter}`)
                break
              default:
                break
            }
          } else {
            danmaku.status = 'ready'
            this.$refs.push(danmaku.$ref)
            danmaku.$ref = null
          }
        }

        if (!this.isStop) this.update()
      }
    })
  }

  continue() {
    const { clientWidth } = this.$player
    this.mapping('stop', (danmaku) => {
      danmaku.status = 'emit'
      danmaku.lastTime = Date.now()
      switch (danmaku.mode) {
        case 0: {
          const translateX = clientWidth + danmaku.$ref!.clientWidth
          danmaku.$ref!.style.transform = `translate3d(${-translateX}px, 0, 0)`
          danmaku.$ref!.style.transition = `transform ${danmaku.restTime}s linear 0s`
          break
        }
        default:
          break
      }
    })
  }

  suspend() {
    const { clientWidth } = this.$player
    this.mapping('emit', (danmaku) => {
      danmaku.status = 'stop'
      switch (danmaku.mode) {
        case 0: {
          const translateX =
            clientWidth - (this.getLeft(danmaku.$ref!) - this.getLeft(this.$player))
          danmaku.$ref!.style.transform = `translate3d(${-translateX}px, 0, 0)`
          danmaku.$ref!.style.transition = 'transform 0s linear 0s'
          break
        }
        default:
          break
      }
    })
  }

  mapping(status: string, callback: (d: QueueItem) => void) {
    this.queue.forEach((danmaku) => danmaku.status === status && callback(danmaku))
  }

  getLeft($ref: HTMLElement) {
    return $ref.getBoundingClientRect().left
  }

  createItem({ text, cssText }: { text: string; cssText: string }): HTMLDivElement {
    const $cache = this.$refs.pop()
    if ($cache) return $cache

    const $ref = document.createElement('div')
    $ref.className = danmakuItemCls
    $ref.innerText = text
    $ref.style.cssText = cssText
    return $ref as HTMLDivElement
  }

  getReady() {
    const { currentTime } = this.player
    return this.queue.filter((danmaku) => {
      return (
        danmaku.status === 'ready' ||
        (danmaku.status === 'wait' &&
          currentTime + 0.1 >= danmaku.time &&
          danmaku.time >= currentTime - 0.1)
      )
    })
  }

  getActiveDanmakusBoundingClientRect() {
    const result: ActiveDanmakuRect[] = []
    const { clientWidth } = this.$player
    const clientLeft = this.getLeft(this.$player)

    this.mapping('emit', (danmaku) => {
      const top = danmaku.$ref!.offsetTop
      const left = this.getLeft(danmaku.$ref!) - clientLeft
      const height = danmaku.$ref!.clientHeight
      const width = danmaku.$ref!.clientWidth
      const distance = left + width
      const right = clientWidth - distance
      const speed = distance / danmaku.restTime

      result.push({
        top,
        left,
        height,
        width,
        right,
        speed,
        distance,
        time: danmaku.restTime,
        mode: danmaku.mode
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
        const top = getDanmaTop(message)
        resolve({ top })
      }
    })
  }

  makeWait(danmaku: QueueItem) {
    danmaku.status = 'wait'
    if (danmaku.$ref) {
      danmaku.$ref.style.opacity = '0'
      danmaku.$ref.style.transform = 'translate3d(0, 0, 0)'
      danmaku.$ref.style.transition = 'transform 0s linear 0s'
      danmaku.$ref.style.left = `${this.$player.clientWidth}px`
      this.$refs.push(danmaku.$ref)
      danmaku.$ref = null
    }
  }

  reset() {
    this.queue.forEach((danmaku) => this.makeWait(danmaku))
  }

  emit(danmaku: DanmakuItem) {
    this.queue.push({
      ...danmaku,
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
    this.player.emit('danmaku:stop')
  }

  show() {
    this.isHide = false
    this.start()
    this.$danmaku.style.display = 'block'
    this.player.emit('danmaku:show')
  }

  hide() {
    this.isHide = true
    this.stop()
    this.queue.forEach((item) => this.makeWait(item))
    this.$danmaku.style.display = 'none'
    this.player.emit('danmaku:hide')
  }

  destroy() {
    this.stop()
    this.worker?.terminate?.()
    this.$danmaku.remove()
    this.player.emit('danmaku:destroy')
  }
}
