import type { PlayerEvent, PlayerOptions, PlayerPlugin, Source } from '@oplayer/core'
import Player from '@oplayer/core'
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

export interface ReactOPlayerProps extends PlayerOptions {
  playing?: boolean
  duration?: number
  aspectRatio?: number
  plugins?: PlayerPlugin[]
  onEvent?: (e: PlayerEvent) => void
}

const ReactOPlayer = forwardRef(
  (props: ReactOPlayerProps & { source?: Source | Promise<Source> }, ref: Ref<Player | null>) => {
    const { playing, duration = 0, aspectRatio = 9 / 16, plugins = [], onEvent, ...rest } = props
    const isInitialMount = useRef(true)

    const player = useRef<Player | null>(null)
    const preSource = usePrevious(rest.source)

    const onRefChange = useCallback((node: HTMLDivElement) => {
      if (node !== null) {
        player.current = Player.make(node, rest).use(plugins).create()
        player.current.seek(duration / 1000)
        if (onEvent) player.current.on(onEvent)
      }
    }, [])

    useEffect(() => {
      if (isInitialMount.current) return
      if (playing) {
        if (player.current && !player.current.isPlaying) player.current?.play()
      } else {
        if (player.current?.isPlaying) player.current?.pause()
      }
    }, [playing])

    useEffect(() => {
      if (isInitialMount.current) return
      if (
        (rest.source instanceof Promise && preSource != rest.source) ||
        (rest.source?.src && preSource?.src !== rest.source.src)
      ) {
        player.current?.changeSource(rest.source)
      }
    }, [rest.source])

    useEffect(() => {
      if (isInitialMount.current) return
      player.current?.seek(duration / 1000)
    }, [duration])

    useEffect(() => {
      if (isInitialMount.current) return
      if (rest.muted) {
        player.current?.mute()
      } else {
        player.current?.unmute()
      }
    }, [rest.muted])

    useEffect(() => {
      if (isInitialMount.current) return
      player.current?.setPlaybackRate(rest.playbackRate!)
    }, [rest.playbackRate])

    useEffect(() => {
      isInitialMount.current = false
      return () => player.current?.destroy()
    }, [])

    useImperativeHandle(ref, () => player.current, [])

    return (
      <div
        style={{
          width: '100%',
          paddingTop: `${aspectRatio * 100}%`,
          backgroundColor: '#f4f4f4',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          ref={onRefChange}
        ></div>
      </div>
    )
  }
)

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export * from '@oplayer/core'

export default ReactOPlayer
