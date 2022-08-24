import { Player } from '../../../packages/core/dist/index.es'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

const ReactOPlayer = forwardRef((props, ref) => {
  const { playing, duration = 0, aspectRatio = 9 / 16, plugins, onEvent, ...rest } = props
  const isInitialMount = useRef(true)

  const player = useRef(null)
  const preSource = usePrevious(rest.source)

  const onRefChange = useCallback((node) => {
    if (node !== null) {
      const instance = Player.make(node, rest)
        .use(plugins || [])
        .create()

      player.current = instance
      instance.seek(duration / 1000)
      if (onEvent) {
        instance.on(onEvent)
      }
    }
  }, [])

  useEffect(() => {
    if (playing) {
      player.current?.play()
    } else {
      player.current?.pause()
    }
  }, [playing])

  useEffect(() => {
    if (isInitialMount.current) return
    if (preSource?.src !== rest.source.src) {
      player.current?.changeSource(rest.source)
      player.current?.setPlaybackRate(rest.playbackRate || 1)
    }
    player.current?.setPoster(rest.source.poster || '')
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
    player.current?.setPlaybackRate(rest.playbackRate)
  }, [rest.playbackRate])

  useEffect(() => {
    isInitialMount.current = false
    return () => player.current?.destroy()
  }, [])

  useImperativeHandle(ref, () => player.current)

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
})

export function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default ReactOPlayer
