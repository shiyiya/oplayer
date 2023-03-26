/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useThemeConfig } from '@docusaurus/theme-common'
import clsx from 'clsx'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './styles.module.css'

import IconMenu from '@theme/Icon/Menu'
import NavbarItem from '@theme/NavbarItem'
import SearchBar from '@theme/SearchBar'
// ColorModeToggle
import Toggle from '@theme/Navbar/ColorModeToggle'
// Logo
import Logo from '@theme/Navbar/Logo'

import {
  useHideableNavbar,
  useLockBodyScroll,
  useWindowSize
} from '@docusaurus/theme-common/internal'

const windowSizes = {
  desktop: 'desktop',
  mobile: 'mobile',
  ssr: 'ssr'
}

const DefaultNavItemPosition = 'right' // If split links by left/right
// if position is unspecified, fallback to right (as v1)

function splitNavItemsByPosition(items) {
  const leftItems = items.filter((item) => (item.position ?? DefaultNavItemPosition) === 'left')
  const rightItems = items.filter((item) => (item.position ?? DefaultNavItemPosition) === 'right')
  return {
    leftItems,
    rightItems
  }
}

function Navbar() {
  const {
    navbar: { items, hideOnScroll, style }
  } = useThemeConfig()
  const [sidebarShown, setSidebarShown] = useState(false)
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll)

  useLockBodyScroll(sidebarShown)

  const showSidebar = useCallback(() => {
    setSidebarShown(true)
  }, [setSidebarShown])

  const hideSidebar = useCallback(() => {
    setSidebarShown(false)
  }, [setSidebarShown])

  const windowSize = useWindowSize()
  useEffect(() => {
    if (windowSize === windowSizes.desktop) {
      setSidebarShown(false)
    }
  }, [windowSize])

  const hasSearchNavbarItem = items.some((item) => item.type === 'search')
  const { leftItems, rightItems } = splitNavItemsByPosition(items)

  let innerClass = ''
  const pathname = useLocation().pathname
  if (pathname === '/' || pathname === '/en/') {
    innerClass = styles.InnerContainer
  }

  return (
    <nav
      ref={navbarRef}
      className={clsx('navbar', 'navbar--fixed-top', {
        'navbar--dark': style === 'dark',
        'navbar--primary': style === 'primary',
        'navbar-sidebar--show': sidebarShown,
        [styles.navbarHideable]: hideOnScroll,
        [styles.navbarHidden]: hideOnScroll && !isNavbarVisible
      })}
    >
      <div className={clsx('navbar__inner', innerClass)}>
        <div className="navbar__items">
          <Logo />
          {leftItems.map((item, i) => (
            <NavbarItem {...item} key={i} />
          ))}
        </div>
        <div className="navbar__items navbar__items--right">
          {rightItems.map((item, i) => (
            <NavbarItem {...item} key={i} />
          ))}
          <QuickSocialLinksView />
          <Toggle aria-label="Dark mode toggle" />
          {!hasSearchNavbarItem && <SearchBar />}
          {items != null && items.length !== 0 && (
            <button
              aria-label="Navigation bar toggle"
              className={clsx('navbar__toggle', styles.NavbarToggle)}
              type="button"
              tabIndex={0}
              onClick={showSidebar}
              onKeyDown={showSidebar}
            >
              <IconMenu />
            </button>
          )}
        </div>
      </div>
      <div role="presentation" className="navbar-sidebar__backdrop" onClick={hideSidebar} />
      <div className="navbar-sidebar">
        <div className="navbar-sidebar__brand">
          <Logo />
        </div>
        <div className="navbar-sidebar__items">
          <div className="menu">
            <ul className="menu__list">
              {items.map((item, i) => (
                <NavbarItem mobile {...item} onClick={hideSidebar} key={i} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

const QuickSocialLinksView = (props) => {
  const { className } = props

  return (
    <div className={clsx(className, styles.IconContainer)}>
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 496 512"
        className={styles.Icon}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        onClick={() => {
          window.open('https://github.com/shiyiya/oplayer', '_blank')
        }}
      >
        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
      </svg>
    </div>
  )
}

export default Navbar
