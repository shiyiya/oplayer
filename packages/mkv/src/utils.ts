export type Chunk = {
  offset: number
  buffer: Uint8Array
  pts: number
  duration: number
  pos: number
  buffered: boolean
}

export function debounceImmediateAndLatest<T extends (...args: any[]) => any>(wait: number, func: T): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any[] | null = null

  const debouncedFunction = function (...args: any[]) {
    // @ts-expect-error
    const context = this

    if (timeoutId === null) {
      // Call immediately on the first call
      func.apply(context, args)
    } else {
      // Store the latest arguments for the last call
      lastArgs = args
    }

    clearTimeout(timeoutId as ReturnType<typeof setTimeout>)

    timeoutId = setTimeout(() => {
      if (lastArgs) {
        func.apply(context, lastArgs)
        lastArgs = null
      }
      timeoutId = null
    }, wait)
  }

  return debouncedFunction as T
}

export const queuedDebounceWithLastCall = <T2 extends any[], T extends (...args: T2) => any>(
  time: number,
  func: T
) => {
  let runningFunction: Promise<ReturnType<T>> | undefined
  let lastCall: Promise<ReturnType<T>> | undefined
  let lastCallArguments: T2 | undefined

  const checkForLastCall =
    (
      timeStart: number,
      resolve: (value: ReturnType<T> | PromiseLike<ReturnType<T>>) => void,
      reject: (reason?: any) => void
    ) =>
    (result: ReturnType<T>) => {
      const currentTime = performance.now()
      setTimeout(
        () => {
          if (!lastCallArguments) {
            runningFunction = undefined
            lastCall = undefined
            return
          }
          const funcResult = (async () => func(...lastCallArguments))()
          lastCallArguments = undefined
          funcResult.then(resolve).catch((err) => {
            console.error(err)
            reject(err)
          })

          let _resolve: (value: ReturnType<T> | PromiseLike<ReturnType<T>>) => void
          let _reject: (reason?: any) => void
          lastCall = new Promise((resolve, reject) => {
            _resolve = resolve
            _reject = reject
          })

          runningFunction = funcResult
            // @ts-ignore
            .then(checkForLastCall(currentTime, _resolve, _reject))
            // @ts-ignore
            .catch((err) => {
              console.error(err)
              return checkForLastCall(timeStart, _resolve, _reject)(err)
            })
        },
        time - (currentTime - timeStart)
      )
      return result
    }

  return (...args: Parameters<T>) => {
    lastCallArguments = args
    if (!runningFunction) {
      const timeStart = performance.now()
      const funcResult = (async () => func(...args))()
      lastCallArguments = undefined
      let _resolve: (value: ReturnType<T> | PromiseLike<ReturnType<T>>) => void
      let _reject: (reason?: any) => void
      lastCall = new Promise((resolve, reject) => {
        _resolve = resolve
        _reject = reject
      })

      runningFunction = funcResult
        // @ts-ignore
        .then(checkForLastCall(timeStart, _resolve, _reject))
        // @ts-ignore
        .catch((err) => {
          console.error(err)
          return checkForLastCall(timeStart, _resolve, _reject)(err)
        })

      return funcResult
    } else {
      return lastCall
    }
  }
}

// const getTimeRanges = (sourceBuffer: SourceBuffer) =>
//   Array(sourceBuffer.buffered.length)
//     .fill(undefined)
//     .map((_, index) => ({
//       index,
//       start: sourceBuffer.buffered.start(index),
//       end: sourceBuffer.buffered.end(index)
//     }))

// todo: reimplement this into a ReadableByteStream https://web.dev/streams/ once Safari gets support
export const toStreamChunkSize = (SIZE: number) => (stream: ReadableStream) =>
  new ReadableStream<Uint8Array>({
    reader: undefined,
    leftOverData: undefined,
    start() {
      this.reader = stream.getReader()
    },
    async pull(controller) {
      const { leftOverData }: { leftOverData: Uint8Array | undefined } = this

      const accumulate = async ({ buffer = new Uint8Array(SIZE), currentSize = 0 } = {}): Promise<{
        buffer?: Uint8Array
        currentSize?: number
        done: boolean
      }> => {
        const { value: newBuffer, done } = await this.reader!.read()
        if (currentSize === 0 && leftOverData) {
          buffer.set(leftOverData)
          currentSize += leftOverData.byteLength
          this.leftOverData = undefined
        }

        if (done) {
          const finalResult = { buffer: buffer.slice(0, currentSize), currentSize, done }
          this.reader = undefined
          this.leftOverData = undefined
          return finalResult
        }

        let newSize
        const slicedBuffer = newBuffer.slice(0, SIZE - currentSize)
        newSize = currentSize + slicedBuffer.byteLength
        buffer.set(slicedBuffer, currentSize)

        if (newSize === SIZE) {
          this.leftOverData = newBuffer.slice(SIZE - currentSize)
          return { buffer, currentSize: newSize, done: false }
        }

        return accumulate({ buffer, currentSize: newSize })
      }
      const { buffer, done } = await accumulate()
      if (buffer?.byteLength) controller.enqueue(buffer)
      if (done) controller.close()
    },
    cancel() {
      this.reader!.cancel()
      this.leftOverData = undefined
    }
  } as UnderlyingDefaultSource<Uint8Array> & {
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    leftOverData: Uint8Array | undefined
  })

export const toBufferedStream = (SIZE: number) => (stream: ReadableStream) =>
  new ReadableStream<Uint8Array>({
    buffers: [],
    currentPullPromise: undefined,
    reader: undefined,
    leftOverData: undefined,
    start() {
      this.reader = stream.getReader()
    },
    async pull(controller) {
      const pull = async () => {
        if (this.buffers.length >= SIZE) return
        this.currentPullPromise = this.reader!.read()
        const { value: newBuffer, done } = await this.currentPullPromise
        this.currentPullPromise = undefined
        if (done) {
          try {
            for (const buffer of this.buffers) controller.enqueue(buffer)
            controller.close()
          } catch (err) {
            // console.error(err)
          }
          return
        }
        this.buffers.push(newBuffer)
        return newBuffer
      }

      const tryToBuffer = async (): Promise<void> => {
        if (this.buffers.length >= SIZE) return

        if (this.buffers.length === 0) {
          const buffer = await pull()
          if (!buffer) return
          return tryToBuffer()
        } else {
          pull().then((buffer) => {
            if (!buffer) return
            tryToBuffer()
          })
        }
      }

      await tryToBuffer()
      try {
        controller.enqueue(this.buffers.shift())
        tryToBuffer()
      } catch (err) {
        if (
          !(
            err instanceof TypeError &&
            (err.message ===
              'ReadableStreamDefaultController.enqueue: Cannot enqueue into a stream that has already been requested to close.' ||
              err.message ===
                `Failed to execute 'enqueue' on 'ReadableStreamDefaultController': Cannot enqueue a chunk into a readable stream that is closed or has been requested to be closed`)
          )
        ) {
          throw err
        }
      }
    },
    cancel() {
      this.reader!.cancel()
    }
  } as UnderlyingDefaultSource<Uint8Array> & {
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    leftOverData: Uint8Array | undefined
    buffers: Uint8Array[]
    currentPullPromise: Promise<ReadableStreamReadResult<Uint8Array>> | undefined
  })
