import { $ } from '@oplayer/core'
import { isMobile } from '../utils'

export const buffered = $.css({
  'background-color': 'hsla(0, 0%, 100%, 0.4)'
})

export const played = $.css({
  'background-color': 'var(--primary-color)'
})

export const dot = $.css({
  width: '100%',
  'pointer-events': 'none',
  '&::before': {
    'margin-left': '-6px',
    transition: 'transform 0.3s ease',
    transform: 'scale(0)',
    content: "''",
    display: 'block',
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    height: '0.8em',
    width: '0.8em',
    'background-color': '#fff',
    'margin-top': '-4.5px',
    'z-index': '1',
    'border-radius': '50%',
    'will-change': 'left'
  }
})

export const hit = $.css({
  position: 'absolute',
  left: '0',
  'border-radius': '4px',
  padding: '5px 7px',
  'background-color': 'rgba(0, 0, 0, 0.62)',
  color: '#fff',
  'font-size': '12px',
  'text-align': 'center',
  transition: 'opacity 0.1s ease-in-out',
  'word-wrap': 'normal',
  'word-break': 'normal',
  'z-index': '2',
  'pointer-events': 'none',
  transform: 'translateX(-50%)',
  opacity: '0',
  bottom: '10px'
})

export const progressDarging = $.css('/* progressDarging */')

export const progress = $.css({
  position: 'relative',
  'box-sizing': 'border-box',
  padding: '5px 0',
  cursor: 'pointer',
  width: '100%',

  [`&.${progressDarging} .${dot}::before ${!isMobile ? `,&:hover .${dot}::before` : ''}`]: {
    transform: 'scale(1)'
  },

  [`&.${progressDarging} .${hit} ${!isMobile ? `,&:hover .${hit}` : ''}`]: {
    opacity: 1
  }
})

export const progressInner = $.css({
  position: 'relative',
  height: '3px',
  width: '100%',
  'background-color': 'hsla(0, 0%, 100%, 0.2)',

  [`& .${buffered},& .${played}`]: {
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    height: '3px',
    'will-change': 'width',
    'pointer-events': 'none'
  }
})
