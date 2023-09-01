import type { PlayerEvent, PlayerOptions, PlayerPlugin, Source } from '@oplayer/core'
import Player from '@oplayer/core'
import {
  DependencyList,
  EffectCallback,
  forwardRef,
  Ref,
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
    const { playbackRate, source, muted } = rest

    const $player = useRef<HTMLDivElement>(null)
    const player = useRef<Player | null>(null)

    const preSource = usePrevious(rest.source)

    const onEventRef = useRef(onEvent)
    onEventRef.current = onEvent

    const instance = player.current!

    useEffectWhere(
      instance,
      () => {
        if (playing != instance.isPlaying) {
          if (playing) {
            instance.play()
          } else {
            instance.pause()
          }
        }
      },
      [playing]
    )

    useEffectWhere(
      instance,
      () => {
        if (
          (source instanceof Promise && preSource != source) ||
          (source?.src && preSource?.src !== source.src)
        ) {
          instance.changeSource(source)
        }
      },
      [source]
    )

    useEffectWhere(
      instance,
      () => {
        if (duration) instance.seek(duration / 1000)
      },
      [duration]
    )

    useEffectWhere(
      instance,
      () => {
        if (muted) {
          instance.mute()
        } else {
          instance.unmute()
        }
      },
      [muted]
    )

    useEffectWhere(
      instance,
      () => {
        instance.setPlaybackRate(playbackRate!)
      },
      [playbackRate]
    )

    useImperativeHandle(ref, () => player.current, [])

    useEffect(() => {
      if (!$player.current) return
      player.current = Player.make($player.current, rest).use(plugins).create()
      if (typeof duration == 'number') player.current.seek(duration / 1000)
      if (onEvent) {
        player.current.on((payload: PlayerEvent) => onEventRef.current?.(payload))
      }
      return () => {
        player.current?.destroy()
        player.current = null
      }
    }, [])

    return useMemo(() => {
      if (aspectRatio == 0) {
        return <div ref={$player}></div>
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
            ref={$player}
          ></div>
        </div>
      )
    }, [])
  }
)

const useEffectWhere = (where: any, cb: EffectCallback, deps?: DependencyList): void => {
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
