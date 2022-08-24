import React from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'
import Translate from '@docusaurus/Translate'
import PrimaryButton from '../../../components/PrimaryButton'
import GithubButton from '../../../components/GithubButton'
import styles from './styles.module.css'
import { useWindowSize } from '../../../hooks/useWindowSize'

const HeaderView = () => {
  const { windowHeight } = useWindowSize()

  return (
    <div className={styles.Wrapper}>
      <div
        className={styles.Container}
        style={{ height: windowHeight > 800 ? windowHeight / 2 : undefined }}
      >
        <div className={styles.ContainerLeft}>
          <div className={styles.HeaderTitle}>Oh! Player</div>
          <div className={styles.DescriptionText}>
            <Translate id="oplayer.desc">Oh! Another HTML5 video player.</Translate>
          </div>
          <div className={styles.ButtonContainer}>
            <PrimaryButton className={styles.GetStartedButton} to={useBaseUrl('/docs/')}>
              <Translate id="oplayer.gettingStarted">Quick Start</Translate>
            </PrimaryButton>
            <GithubButton
              className={styles.GithubButton}
              to={'https://github.com/shiyiya/oplayer'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderView
