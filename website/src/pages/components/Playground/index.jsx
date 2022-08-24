import React, { useEffect } from 'react'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

import Translate from '@docusaurus/Translate'
import styles from './styles.module.css'

const Playground = () => {
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const Player = require('@oplayer/core').default
      const ui = require('@oplayer/ui').default
      const danmuku = require('@oplayer/danmuku').default

      setTimeout(() => {
        Player.make(document.querySelector('#oplayer'), {
          source: { src: 'https://oplayer.vercel.app/君の名は.mp4' }
        })
          .use([
            danmuku({ source: 'https://oplayer.vercel.app/danmuku.xml' }),
            ui({
              theme: { primaryColor: '#9370db' },
              subtitle: [
                {
                  name: '君の名は',
                  default: true,
                  url: 'https://oplayer.vercel.app/君の名は.srt'
                }
              ]
            })
          ])
          .create()
      })
    }
  }, [])
  return (
    <div className={styles.Container} id="preview">
      <div className={styles.Title}>
        <Translate id="oplayer.preview">Preview</Translate>
      </div>
      <div>
        <div className={styles.VideoContainer} id="oplayer">
          {/* <BrowserOnly>
            {() => {
              //TODO: SSR
              // const ReactPlayer = (await import('../../../components/Player')).default
              // const ui = (await import('@oplayer/ui')).default
              // const danmuku = (await import('@oplayer/danmuku')).default

              const plugins = [
                // ui({
                //   theme: { primaryColor: '#9370db' },
                //   subtitle: [
                //     {
                //       name: '君の名は',
                //       default: true,
                //       url: 'https://oplayer.vercel.app/君の名は.srt'
                //     }
                //   ]
                // }),
                // danmuku({ source: 'https://oplayer.vercel.app/danmuku.xml' })
              ]
              return (
                <ReactPlayer
                  plugins={plugins}
                  source={{ src: 'https://oplayer.vercel.app/君の名は.mp4' }}
                />
              )
            }}
          </BrowserOnly> */}
        </div>
      </div>
    </div>
  )
}

export default Playground
