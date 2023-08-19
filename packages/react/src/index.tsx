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

    const player = useRef<Player | null>(null)

    const preSource = usePrevious(rest.source)
    const isReady = Boolean(player.current)

    const onEventRef = useRef(onEvent)
    onEventRef.current = onEvent

    const onRefChange = useCallback((node: HTMLDivElement) => {
      if (node !== null && !isReady) {
        player.current = Player.make(node, rest).use(plugins).create()
        if (typeof duration == 'number') player.current.seek(duration / 1000)
        if (onEvent) {
          player.current.on((payload: PlayerEvent) => onEventRef.current?.(payload))
        }
      }
    }, [])

    const { playbackRate, source, muted } = rest
    const safePlayer = player.current! // can only use on isReady

    useEffectWhere(
      isReady,
      () => {
        if (playing != safePlayer.isPlaying) {
          if (playing) {
            safePlayer.play()
          } else {
            safePlayer.pause()
          }
        }
      },
      [playing]
    )

    useEffectWhere(
      isReady,
      () => {
        if (
          (source instanceof Promise && preSource != source) ||
          (source?.src && preSource?.src !== source.src)
        ) {
          safePlayer.changeSource(source)
        }
      },
      [source]
    )

    useEffectWhere(
      isReady,
      () => {
        if (duration) safePlayer.seek(duration / 1000)
      },
      [duration]
    )

    useEffectWhere(
      isReady,
      () => {
        if (muted) {
          safePlayer.mute()
        } else {
          safePlayer.unmute()
        }
      },
      [muted]
    )

    useEffectWhere(
      isReady,
      () => {
        safePlayer.setPlaybackRate(playbackRate!)
      },
      [playbackRate]
    )

    useImperativeHandle(ref, () => player.current, [])

    useEffect(() => {
      return () => {
        // strict mode: destory, but ref cb call once
        player.current?.destroy()
        player.current = null
      }
    }, [])

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

const useEffectWhere = (where: boolean, cb: EffectCallback, deps?: DependencyList): void => {
  useEffect(() => {
    if (where) {
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
