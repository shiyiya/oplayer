import { $ } from '@oplayer/core'
import type { SnowConfig } from './types'
import { hexToRgb } from './utils'

export const settingShown = $.css('/* settingShown */')

export const root = (theme: SnowConfig['theme']) => {
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
    width: 100% !important;
    height: 100% !important;
    position: fixed !important;
    inset: 0; !important`

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
