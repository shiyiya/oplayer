/**
 *  https://github.com/Banou26/media-player
 */

import { type Player, type PlayerPlugin, type Source } from '@oplayer/core'
import { type Chunk, makeRemuxer } from 'libav-wasm'
import PQueue from 'p-queue'
import {
  debounceImmediateAndLatest,
  queuedDebounceWithLastCall,
  toBufferedStream,
  toStreamChunkSize
} from './utils'

const PLUGIN_NAME = 'oplayer-plugin-mkv'

type UnPromisify<T> = T extends Promise<infer U> ? U : never

export interface MkvPluginOptions {
  baseBufferSize?: number
  publicPath: string
  wasmUrl: string
  libavWorkerUrl: string
  libavWorkerOptions?: WorkerOptions
  libassWorkerUrl: string
}

class MkvPlugin implements PlayerPlugin {
  key = 'mkv'
  name = PLUGIN_NAME
  version = __VERSION__

  player!: Player

  instance?: UnPromisify<ReturnType<typeof makeRemuxer>>

  options: MkvPluginOptions

  constructor(options: MkvPluginOptions) {
    this.options = options
  }

  apply(player: Player) {
    this.player = player
    return this
  }

  async load({ $video }: Player, source: Source) {
    if (!(source.format == 'mkv' || /mkv(#|\?|$)/i.test(source.src))) return false

    const { publicPath, libavWorkerUrl, libavWorkerOptions, baseBufferSize = 2_500_000 } = this.options || {}

    const contentLength = await this.fetchSourceContentLength(source, [0, 1])

    const remuxer = (this.instance = await makeRemuxer({
      publicPath: publicPath || 'http://localhost:5173/@fs/D:/Code/oplayer/packages/mkv/w/',
      workerUrl:
        libavWorkerUrl ||
        ((() => {
          const workerUrl =
            'http://localhost:5173/@fs/D:/Code/oplayer/packages/mkv/w/libav.js?text' ||
            new URL('../dist/libav.js', new URL(window.location.toString()).origin).toString()
          const blob = new Blob([`importScripts(${JSON.stringify(workerUrl)})`], {
            type: 'application/javascript'
          })
          return URL.createObjectURL(blob)
        })() as any),
      workerOptions: libavWorkerOptions,
      bufferSize: baseBufferSize,
      length: contentLength,
      getStream: async (offset = 0, _size) => {
        let size = _size ? Math.min(offset + _size, contentLength) - 1 : ''

        if (!_size && navigator.userAgent.includes('Firefox')) {
          size = Math.min(offset + 5_000_000, contentLength)
        }

        const res = await fetch(source.src, { headers: { Range: `bytes=${offset}-${size}` } })
        return _size ? res.body! : toBufferedStream(3)(toStreamChunkSize(baseBufferSize)(res.body!))
      },
      subtitle: (title, language, subtitle) => {},
      attachment: (filename: string, mimetype: string, buffer: ArrayBuffer) => {}
    }))

    const chunk = await remuxer.init()
    if (!chunk) throw new Error('No header chunk found after remuxer init')

    const mediaInfo = await remuxer.getInfo()
    const duration = mediaInfo.input.duration / 1_000_000
    const mediaSource = new MediaSource()
    $video.src = URL.createObjectURL(mediaSource)

    const sourceBuffer: SourceBuffer = await new Promise((resolve) =>
      mediaSource.addEventListener(
        'sourceopen',
        () => {
          const sourceBuffer = mediaSource.addSourceBuffer(
            `video/mp4; codecs="${mediaInfo.input.video_mime_type},${mediaInfo.input.audio_mime_type}"`
          )
          mediaSource.duration = duration
          sourceBuffer.mode = 'segments'
          resolve(sourceBuffer)
        },
        { once: true }
      )
    )
    const queue = new PQueue({ concurrency: 1 })

    const setupListeners = (resolve: (value: Event) => void, reject: (reason: Event) => void) => {
      const updateEndListener = (ev: Event) => {
        resolve(ev)
        unregisterListeners()
      }
      const abortListener = (ev: Event) => {
        resolve(ev)
        unregisterListeners()
      }
      const errorListener = (ev: Event) => {
        console.error(ev)
        reject(ev)
        unregisterListeners()
      }
      const unregisterListeners = () => {
        sourceBuffer.removeEventListener('updateend', updateEndListener)
        sourceBuffer.removeEventListener('abort', abortListener)
        sourceBuffer.removeEventListener('error', errorListener)
      }
      sourceBuffer.addEventListener('updateend', updateEndListener, { once: true })
      sourceBuffer.addEventListener('abort', abortListener, { once: true })
      sourceBuffer.addEventListener('error', errorListener, { once: true })
    }

    const appendBuffer = (buffer: ArrayBuffer) =>
      queue.add(
        () =>
          new Promise<Event>((resolve, reject) => {
            setupListeners(resolve, reject)
            sourceBuffer.appendBuffer(buffer)
          })
      )

    const unbufferRange = async (start: number, end: number) =>
      queue.add(
        () =>
          new Promise((resolve, reject) => {
            setupListeners(resolve, reject)
            sourceBuffer.remove(start, end)
          })
      )

    const getTimeRanges = () =>
      Array(sourceBuffer.buffered.length)
        .fill(undefined)
        .map((_, index) => ({
          index,
          start: sourceBuffer.buffered.start(index),
          end: sourceBuffer.buffered.end(index)
        }))

    let chunks: Chunk[] = []
    const PREVIOUS_BUFFER_COUNT = 1
    const NEEDED_TIME_IN_SECONDS = 15

    await appendBuffer(chunk.buffer)

    let reachedEnd = false

    const pull = async () => {
      const chunk = await remuxer.read()
      reachedEnd = chunk.isTrailer

      if (reachedEnd) {
        this.player.emit('ended')
      }

      chunks = [...chunks, chunk]
      return chunk
    }

    let seeking = false

    const updateBuffers = queuedDebounceWithLastCall(250, async () => {
      if (seeking) return
      const { currentTime } = $video
      const currentChunkIndex = chunks.findIndex(
        ({ pts, duration }) => pts <= currentTime && pts + duration >= currentTime
      )
      const sliceIndex = Math.max(0, currentChunkIndex - PREVIOUS_BUFFER_COUNT)

      const getLastChunkEndTime = () => {
        const lastChunk = chunks.at(-1)
        if (!lastChunk) return 0
        return lastChunk.pts + lastChunk.duration
      }

      while (getLastChunkEndTime() < currentTime + NEEDED_TIME_IN_SECONDS) {
        const chunk = await pull()
        await appendBuffer(chunk.buffer)
      }

      if (sliceIndex) chunks = chunks.slice(sliceIndex)

      const bufferedRanges = getTimeRanges()

      const firstChunk = chunks.at(0)
      const lastChunk = chunks.at(-1)
      if (!firstChunk || !lastChunk || firstChunk === lastChunk) return
      const minTime = firstChunk.pts

      for (const { start, end } of bufferedRanges) {
        const chunkIndex = chunks.findIndex(
          ({ pts, duration }) => start <= pts + duration / 2 && pts + duration / 2 <= end
        )
        if (chunkIndex === -1) {
          await unbufferRange(start, end)
        } else {
          if (start < minTime) {
            await unbufferRange(start, minTime)
          }
        }
      }
    })

    let firstSeekPaused: boolean | undefined
    const seek = debounceImmediateAndLatest(250, async (seekTime: number) => {
      try {
        reachedEnd = false
        if (firstSeekPaused === undefined) firstSeekPaused = $video.paused
        seeking = true
        chunks = []
        await remuxer.seek(seekTime)
        const chunk1 = await pull()
        // firefox sometimes throws "Uncaught (in promise) DOMException: An attempt was made to use an object that is not, or is no longer, usable"
        sourceBuffer.timestampOffset = chunk1.pts
        await appendBuffer(chunk1.buffer)
        if (firstSeekPaused === false) {
          await $video.play()
        }
        seeking = false
        await updateBuffers()
        if (firstSeekPaused === false) {
          await $video.play()
        }
        firstSeekPaused = undefined
      } catch (err: any) {
        if (err.message !== 'exit') throw err
      }
    })

    const firstChunk = await pull()
    appendBuffer(firstChunk.buffer)

    $video.addEventListener('timeupdate', updateBuffers)

    $video.addEventListener('waiting', updateBuffers)

    $video.addEventListener('seeking', () => {
      seek($video.currentTime)
    })

    updateBuffers()

    return this
  }

  fetchSourceContentLength(source: Source, range: [number, number]) {
    return fetch(source.src, { headers: { Range: `bytes=${range[0]}-${range[1]}` } }).then(
      ({ headers, body }) => {
        if (!body) throw new Error('Empty source buffer')
        const contentRangeContentLength = headers.get('Content-Range')?.split('/').at(1)
        const contentLength = contentRangeContentLength
          ? Number(contentRangeContentLength)
          : Number(headers.get('Content-Length'))
        return contentLength
      }
    )
  }

  unload() {}

  destroy() {
    this.instance?.destroy(true)
  }
}

export default function create(options: MkvPluginOptions): PlayerPlugin {
  return new MkvPlugin(options)
}
