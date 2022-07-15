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

export const icon = $.css({
  display: 'inline-block',
  margin: '0px',
  padding: '0.5em',
  border: 'none',
  'border-radius': '0px',
  'font-size': 'inherit',
  color: 'rgba(255, 255, 255, 0.7)',
  background: 'none',
  cursor: 'pointer',
  transition: 'color 300ms ease 0s',
  '@media only screen and (max-width: 991px)': {
    '&': {
      padding: '4px 8px'
    }
  }
})
