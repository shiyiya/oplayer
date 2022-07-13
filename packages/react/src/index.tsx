import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Player, { PlayerPlugin, PlayerOptions, PlayerEvent } from '@oplayer/core'

interface OPlayerProps extends PlayerOptions {
  duration?: number
  plugins?: PlayerPlugin[]
  onEvent?: (e: PlayerEvent) => void
}

const ReactPlayer = forwardRef<Player, OPlayerProps>(
  ({ plugins, duration = 0, onEvent, ...rest }, ref) => {
    const isInitial = useRef(false)
    const [player, setPlayer] = useState<Player>()

    const onRefChange = useCallback((node: HTMLDivElement) => {
      if (node !== null) {
        const instance = Player.make(node, rest)
          .use(plugins || [])
          .create()

        setPlayer(instance)
        instance!.seek(duration / 1000)
        if (onEvent) {
          instance!.on(onEvent)
        }
      }
    }, [])

    useEffect(() => () => player?.destroy(), [])

    useEffect(() => {
      if (isInitial.current) {
        player?.changeSource(rest.source)
        player?.setPlaybackRate(rest.playbackRate || 1)
      } else {
        isInitial.current = true
      }
    }, [player, rest.source])

    useEffect(() => {
      player?.seek(duration / 1000)
    }, [duration])

    useEffect(() => {
      if (rest.muted) {
        player?.mute()
      } else {
        player?.unmute()
      }
    }, [rest.muted])

    useEffect(() => {
      player?.setPlaybackRate(rest.playbackRate!)
    }, [rest.playbackRate])

    useImperativeHandle(ref, () => player as Player, [player])

    return (
      <div
        style={{
          width: '100%',
          paddingTop: `${(9 / 16) * 100}%`,
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

export default ReactPlayer
