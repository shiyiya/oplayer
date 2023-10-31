import type { PlayerEvent, PlayerOptions, PlayerPlugin, Source } from '@oplayer/core'
import Player from '@oplayer/core'
import {
  DependencyList,
  EffectCallback,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react'

export interface ReactOPlayerProps extends PlayerOptions {
  playing?: boolean
  duration?: number
  aspectRatio?: number
  plugins?: PlayerPlugin[]
  onEvent?: (e: PlayerEvent) => void
}

const ReactOPlayer = forwardRef(
  (props: ReactOPlayerProps & { source?: Source | Promise<Source> }, ref: Ref<Player | null>) => {
    const { playing, duration, aspectRatio = 9 / 16, plugins = [], onEvent, ...rest } = props

    const onEventRef = useRef(onEvent)
    onEventRef.current = onEvent

    const player = useRef<Player | null>(null)
    const preSource = usePrevious(rest.source)

    const isReady = player.current && player.current.$root

    const onRefChange = useCallback((node: HTMLDivElement) => {
      if (node !== null && !isReady) {
        player.current = Player.make(node, rest).use(plugins).create()
        if (typeof duration == 'number') player.current.seek(duration / 1000)
        if (onEvent) {
          player.current.on((payload: PlayerEvent) => onEventRef.current?.(payload))
        }
      }
    }, [])

    useEffectIf(
      isReady,
      () => {
        if (playing) {
          if (!player.current!.isPlaying) player.current!.play()
        } else {
          if (player.current!.isPlaying) player.current!.pause()
        }
      },
      [playing]
    )

    useEffectIf(
      isReady,
      () => {
        if (
          (rest.source instanceof Promise && preSource != rest.source) ||
          (rest.source?.src && preSource?.src !== rest.source.src)
        ) {
          player.current!.changeSource(rest.source)
        }
      },
      [rest.source]
    )

    useEffectIf(
      isReady && typeof duration === 'number',
      () => {
        player.current!.seek(duration! / 1000)
      },
      [duration]
    )

    useEffectIf(
      isReady,
      () => {
        if (rest.muted) {
          player.current!.mute()
        } else {
          player.current!.unmute()
        }
      },
      [rest.muted]
    )

    useEffectIf(
      isReady,
      () => {
        player.current!.setPlaybackRate(rest.playbackRate!)
      },
      [rest.playbackRate]
    )

    useEffect(() => {
      return () => player.current?.destroy()
    }, [])

    useImperativeHandle(ref, () => player.current, [])

    return useMemo(() => {
      if (aspectRatio == 0) {
        return <div ref={onRefChange}></div>
      }

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
    }, [])
  }
)

const useEffectIf = (where: any, cb: EffectCallback, deps?: DependencyList): void => {
  useEffect(() => {
    if (Boolean(where)) {
      return cb()
    }
  }, deps)
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export * from '@oplayer/core'

export default ReactOPlayer
