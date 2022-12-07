import React, { useEffect } from 'react'
import { Player } from '../../../packages/core/dist/index.es'
import ui from '../../../packages/ui/dist/index.es'
import hls from '../../../packages/hls/dist/index.es'

export default () => {
  useEffect(() => {
    Player.make(document.getElementById('oplayer'), {
      source: { src: document.location.search.substring(1) }
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
      .on(console.log)
  }, [])

  return <div id="oplayer" style={{ width: '100vw', height: '100vh' }} />
}
