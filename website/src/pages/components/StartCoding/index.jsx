import Translate from '@docusaurus/Translate'
import useBaseUrl from '@docusaurus/useBaseUrl'
import React from 'react'
import CodeBlock from '../../../components/CodeBlock'
import PrimaryButton from '../../../components/PrimaryButton'
import styles from './styles.module.css'

const code = `import Player from '@oplayer/core'
import ui from '@oplayer/ui'
import danmaku from '@oplayer/danmaku'

Player.make(document.body, {
  source: { src: 'https://oplayer.vercel.app/君の名は.mp4' }
})
  .use([
    danmaku({ source: 'https://oplayer.vercel.app/danmaku.xml' }),
    ui({
      theme: { primaryColor: '#9370db' },
      subtitle: [
        {
          text: '君の名は',
          default: true,
          url: 'https://oplayer.vercel.app/君の名は.srt'
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
