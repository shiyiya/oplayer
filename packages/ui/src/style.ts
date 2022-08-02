import { $ } from '@oplayer/core'
import type { SnowConfig } from './types'

export const root = (theme: SnowConfig['theme']) =>
  $.css({
    '--primary-color': `${theme?.primaryColor}`,
    /* https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba */
    '--shadow-color': `${theme?.primaryColor}7F`,
    '--shadow-color-4': `${theme?.primaryColor}66`,

    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    left: '0',

    '&, & > *': {
      '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
    }
  })

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
