import { bilibiliDanmuParseFromUrl } from './bilibili-parse'
import getDanmuTop from './top'

import Player, { $ } from '@oplayer/core'
import { DanmukuItem, Option, QueueItem } from './types'

const danmukuItemCls = $.css`
  position: absolute;
  white-space: pre;
  pointer-events: none;
  perspective: 500px;
  display: inline-block;
  will-change: transform;
  visibility: hidden;
  text-shadow: rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px, rgb(0, 0, 0) -1px 0px 1px;
`

export default class Danmuku {
  $player: HTMLDivElement
  $danmuku: HTMLDivElement

  isStop: boolean = false
  isHide: boolean = false
  timer: number | null = null
  queue: QueueItem[] = []
  $refs: HTMLDivElement[] = []
  worker: any

  constructor(public player: Player, public option: Option) {
    this.$player = player.$root as HTMLDivElement
    this.$danmuku = $.create(
      `div.${$.css`width: 100%; height: 100%; position: absolute; left: 0; top: 0; pointer-events: none;`}`
    )

    player.on(['play', 'playing'], this.start.bind(this))
    player.on(['pause', 'waiting'], this.stop.bind(this))
    player.on(['fullscreen', 'webfullscreen'], this.reset.bind(this))
    player.on('destroy', this.destroy.bind(this))

    this.fetch()
    $.render(this.$danmuku, this.$player)
  }

  async fetch() {
    try {
      let danmukus: DanmukuItem[] = []
      if (typeof this.option.danmuku === 'function') {
        danmukus = await this.option.danmuku()
      } else if (typeof this.option.danmuku === 'string') {
        danmukus = await bilibiliDanmuParseFromUrl(this.option.danmuku)
      } else {
        danmukus = this.option.danmuku
      }
      this.player.emit('danmukuloaded', danmukus)
      this.load(danmukus)
    } catch (error) {
      this.player.emit('notice', { text: 'danmuku: ' + (<Error>error).message })
      throw error
    }
  }

  //TODO: 分批次加载 10s 加载一次
  load(danmukus: DanmukuItem[]) {
    this.queue = []
    this.$danmuku.innerHTML = ''

    danmukus.forEach((danmuku) => {
      if (this.option?.filter && this.option.filter(danmuku)) return

      this.queue.push({
        mode: this.option.mode,
        color: this.option.color,
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

  continue() {
    const { clientWidth } = this.$player
    this.mapping('stop', (danmu) => {
      danmu.status = 'emit'
      danmu.lastTime = Date.now()
      switch (danmu.mode) {
        case 0: {
          const translateX = clientWidth + danmu.$ref!.clientWidth
          danmu.$ref!.style.transform = `translateX(${-translateX}px)`
          danmu.$ref!.style.transition = `transform ${danmu.restTime}s linear 0s`
          break
        }
        default:
          break
      }
    })
  }

  update() {
    this.timer = window.requestAnimationFrame(async () => {
      if (this.player.isPlaying && !this.isHide) {
        this.mapping('emit', (danmu) => {
          const emitTime = (Date.now() - danmu.lastTime) / 1000
          danmu.restTime -= emitTime
          danmu.lastTime = Date.now()
          if (danmu.restTime <= 0) {
            this.makeWait(danmu)
          }
        })

        const readys = this.getReady()
        const { clientWidth, clientHeight } = this.$player

        console.log(readys.length)

        for (let index = 0; index < readys.length; index++) {
          const danmu = readys[index]!
          danmu.$ref = this.createItem({
            text: danmu.text,
            styles: {
              left: `${clientWidth}px`,
              opacity: this.option.opacity ? String(this.option.opacity) : false,
              fontSize: this.option.fontSize ? `${this.option.fontSize}px` : false,
              color: danmu.color ? danmu.color : false,
              border: danmu.border ? `1px solid ${danmu.color}` : false,
              backgroundColor: danmu.border ? 'rgb(0 0 0 / 50%)' : false
            }
          })
          this.$danmuku.appendChild(danmu.$ref)

          danmu.lastTime = Date.now()
          danmu.restTime =
            this.option.synchronousPlayback && this.player.playbackRate
              ? this.option.speed / Number(this.player.playbackRate)
              : this.option.speed

          const target = {
            mode: danmu.mode,
            height: danmu.$ref.clientHeight,
            speed: (clientWidth + danmu.$ref.clientWidth) / danmu.restTime
          }

          const { top } = await this.postMessage({
            target,
            clientWidth,
            emits: this.getEmits(),
            clientHeight,
            antiOverlap: this.option.antiOverlap,
            marginTop: this.option.margin[0],
            marginBottom: this.option.margin[1]
          })

          if (danmu.$ref) {
            if (!this.isStop && top !== -1) {
              danmu.status = 'emit'
              danmu.$ref.style.visibility = 'visible'

              switch (danmu.mode) {
                case 0: {
                  danmu.$ref.style.top = `${top}px`
                  const translateX = clientWidth + danmu.$ref.clientWidth
                  danmu.$ref.style.transform = `translateX(${-translateX}px)`
                  danmu.$ref.style.transition = `transform ${danmu.restTime}s linear 0s`
                  break
                }
                case 1:
                  danmu.$ref.style.left = '50%'
                  danmu.$ref.style.top = `${top}px`
                  danmu.$ref.style.marginLeft = `-${danmu.$ref.clientWidth / 2}px`
                  break
                default:
                  break
              }
            } else {
              danmu.status = 'ready'
              this.$refs.push(danmu.$ref)
              danmu.$ref = null
            }
          }
        }
      }

      if (!this.isStop) {
        this.update()
      }
    })
  }

  mapping(status: string, callback: (d: QueueItem) => void) {
    this.queue.forEach((danmu) => danmu.status === status && callback(danmu))
  }

  getLeft($ref: HTMLElement) {
    const rect = $ref.getBoundingClientRect()
    return rect.left
  }

  createItem({
    text,
    styles
  }: {
    text: string
    styles: Record<string, string | boolean | undefined>
  }): HTMLDivElement {
    const $ref = $.create(`div.${danmukuItemCls}`)
    $ref.innerText = text
    Object.keys(styles).forEach((name) => {
      //@ts-ignore
      if (typeof styles[name] == 'string') $ref.style[name] = styles[name]
    })
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

  getEmits() {
    const result: any = []
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
      if (this.option.useWorker && this.worker && this.worker.postMessage) {
        message.id = Date.now()
        this.worker.postMessage(message)
        this.worker.onmessage = (event: any) => {
          const { data } = event
          if (data.id === message.id) {
            resolve(data)
          }
        }
      } else {
        const top = getDanmuTop(message)
        resolve({ top })
      }
    })
  }

  makeWait(danmu: QueueItem) {
    danmu.status = 'wait'
    if (danmu.$ref) {
      danmu.$ref.style.visibility = 'hidden'
      danmu.$ref.style.marginLeft = '0px'
      danmu.$ref.style.transform = 'translateX(0px)'
      danmu.$ref.style.transition = 'transform 0s linear 0s'
      this.$refs.push(danmu.$ref)
      danmu.$ref = null
    }
  }

  suspend() {
    const { clientWidth } = this.$player
    this.mapping('emit', (danmu) => {
      danmu.status = 'stop'
      switch (danmu.mode) {
        case 0: {
          const translateX = clientWidth - (this.getLeft(danmu.$ref!) - this.getLeft(this.$player))
          danmu.$ref!.style.transform = `translateX(${-translateX}px)`
          danmu.$ref!.style.transition = 'transform 0s linear 0s'
          break
        }
        default:
          break
      }
    })
  }

  reset() {
    this.queue.forEach((danmu) => this.makeWait(danmu))
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
    if (this.worker && this.worker.terminate) this.worker.terminate()
    this.player.emit('danmuku:destroy')
  }
}
