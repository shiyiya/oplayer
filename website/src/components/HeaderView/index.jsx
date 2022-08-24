import Translate from '@docusaurus/Translate'
import useBaseUrl from '@docusaurus/useBaseUrl'
import React from 'react'
import { useWindowSize } from '../../hooks/useWindowSize'
import GithubButton from '../GithubButton'
import PrimaryButton from '../PrimaryButton'
import styles from './styles.module.css'

const HeaderView = () => {
  return (
    <div className={styles.Wrapper}>
      <div className={styles.Container}>
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
