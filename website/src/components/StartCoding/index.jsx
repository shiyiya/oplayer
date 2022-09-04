import Translate from '@docusaurus/Translate'
import useBaseUrl from '@docusaurus/useBaseUrl'
import React from 'react'
import CodeBlock from '../CodeBlock'
import PrimaryButton from '../PrimaryButton'
import styles from './styles.module.css'

const code = `import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import danmaku from '@oplayer/danmaku'

Player.make(document.body, {
  source: {
    src: 'https://oplayer.vercel.app/君の名は.mp4',
    poster: 'https://oplayer.vercel.app/poster.png'
  }
})
  .use([
    danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml' }),
    ui({
      theme: { primaryColor: '#6668ab' },
      subtitle: {
        source: [
          {
            name: 'Default',
            default: true,
            src: 'https://oplayer.vercel.app/君の名は.srt'
          }
        ]
      },
      thumbnails: { src: 'https://oplayer.vercel.app/thumbnails.jpg', number: 100 },
      highlight: [
        {
          time: 12,
          text: '谁でもいいはずなのに'
        },
        {
          time: 34,
          text: '夏の想い出がまわる'
        },
        {
          time: 58,
          text: 'こんなとこにあるはずもないのに'
        },
        {
          time: 88,
          text: '－－终わり－－'
        }
      ]
    })
  ])
  .create()`

const StartCoding = () => {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <div className={styles.Title}>
          <Translate id="oplayer.quick">Quick Start</Translate>
        </div>
        <div>
          <div className={styles.Tagline}>
            <Translate id="oplayer.quick1nd">Step 1: Install OPlayer</Translate>
          </div>
          <CodeBlock
            language="bash"
            code={`pnpm i @oplayer/core @oplayer/ui  @oplayer/danmaku\r\n#or \r\nyarn add @oplayer/core @oplayer/ui @oplayer/danmaku`}
          />
        </div>
        <div>
          <div className={styles.Tagline}>
            <Translate id="oplayer.quick2nd">Step 2: Use OPlayer</Translate>
          </div>
          <CodeBlock code={code} />
        </div>
        <PrimaryButton className={styles.LearnMoreBtn} to={useBaseUrl('/docs/')}>
          <Translate id="oplayer.learnMore">Learn more</Translate>
        </PrimaryButton>
      </div>
    </div>
  )
}

export default StartCoding
