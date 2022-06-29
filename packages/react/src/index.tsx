import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Player, { PlayerPlugin, Options } from '@oplayer/core'

interface OPlayerProps extends Options {
  plugins?: PlayerPlugin[]
}


const ReactPlayer = forwardRef(({ plugins, ...rest }: OPlayerProps, ref: Player) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<Player>()

  const isInitial = useRef(false)

  useEffect(() => {
    const player = Player.make(containerRef.current!, rest)
      .use(plugins || [])
      .create()
    setPlayer(player)

    return () => {
      player.destroy()
    }
  }, [])

  useEffect(() => {
    if (isInitial.current) {
      player?.changeSource(rest.source)
    } else {
      isInitial.current = true
    }
  }, [player, rest.source])

  useImperativeHandle(ref, () => player, [player])

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
        ref={containerRef}
      ></div>
    </div>
  )
})

export default ReactPlayer