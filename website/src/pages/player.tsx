import React, { useEffect } from 'react'
import { Player } from '../../../packages/core/dist/index.es'
import ui from '../../../packages/ui/dist/index.es'
import hls from '../../../packages/hls/dist/index.es'

export default () => {
  useEffect(() => {
    const url = new URL(document.location.href).searchParams.get('url')
    Player.make(document.getElementById('oplayer'), {
      source: { src: url }
    })
      .use([
        ui(),
        hls({
          options: {
            hlsQualityControl: true,
            hlsQualitySwitch: 'immediate'
          }
        })
      ])
      .create()
  }, [])

  return <div id="oplayer" style={{ width: '100vw', height: '100vh' }} />
}
