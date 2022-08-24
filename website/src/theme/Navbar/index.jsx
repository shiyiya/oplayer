/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useThemeConfig } from '@docusaurus/theme-common'
import clsx from 'clsx'
import React, { useCallback, useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/all'
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
      <FaGithub
        className={styles.Icon}
        onClick={() => {
          window.open('https://github.com/shiyiya/oplayer', '_blank')
        }}
      />
    </div>
  )
}

export default Navbar
