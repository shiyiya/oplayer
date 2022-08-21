import { $ } from '@oplayer/core'
import type { UiConfig } from './types'
import { hexToRgb } from './utils'

export const settingShown = $.css('/* settingShown */')

export const root = (theme: UiConfig['theme']) => {
  const rbg = hexToRgb(theme!.primaryColor)!

  return $.css({
    '--primary-color': `rgba(${rbg}, 1)`,
    '--shadow-color-4': `rgba(${rbg}, 0.4)`,

    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    left: '0',

    '&, & > *': {
      '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
    }
  })
}

export const webFullScreen = $.css`
    z-index: 9999 !important;
    position: fixed !important;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;`

export const icon = $.css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
  font: 'inherit',
  color: 'inherit',
  'line-height': 'inherit',
  'text-align': 'inherit',
  width: '100%'
})
