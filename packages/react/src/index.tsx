import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import Player, { PlayerPlugin, PlayerOptions, PlayerEvent } from '@oplayer/core'

interface OPlayerProps extends PlayerOptions {
  playing?: boolean
  duration?: number
  aspectRatio?: number
  plugins?: PlayerPlugin[]
  onEvent?: (e: PlayerEvent) => void
}

const ReactPlayer = forwardRef<Player, OPlayerProps>(
  ({ playing, duration = 0, aspectRatio = 9 / 16, plugins, onEvent, ...rest }, ref) => {
    const isInitialMount = useRef(true)

    const player = useRef<Player>()
    const preSource = usePrevious(rest.source)

    const onRefChange = useCallback((node: HTMLDivElement) => {
      if (node !== null) {
        const instance = Player.make(node, rest)
          .use(plugins || [])
          .create()

        player.current = instance
        instance.seek(duration / 1000)
        if (onEvent) {
          instance!.on(onEvent)
        }
      }
    }, [])

    useEffect(() => () => player.current?.destroy(), [])

    useEffect(() => {
      if (playing) {
        player.current?.play()
      } else {
        player.current?.pause()
      }
    }, [playing])

    useEffect(() => {
      if (isInitialMount) return
      if (preSource?.src !== rest.source.src) {
        player.current?.changeSource(rest.source)
        player.current?.setPlaybackRate(rest.playbackRate || 1)
      }
      player.current?.setPoster(rest.source.poster || '')
    }, [rest.source])

    useEffect(() => {
      if (isInitialMount) return
      player.current?.seek(duration / 1000)
    }, [duration])

    useEffect(() => {
      if (isInitialMount) return
      if (rest.muted) {
        player.current?.mute()
      } else {
        player.current?.unmute()
      }
    }, [rest.muted])

    useEffect(() => {
      if (isInitialMount) return
      player.current?.setPlaybackRate(rest.playbackRate!)
    }, [rest.playbackRate])

    useImperativeHandle(ref, () => player.current as Player, [player])

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

export function usePrevious<T>(value: T) {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default ReactPlayer
