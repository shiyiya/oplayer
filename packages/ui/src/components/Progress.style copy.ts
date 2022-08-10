import { $ } from '@oplayer/core'

export const buffered = $.css({
  'background-color': 'rgba(255,255,255,.4)'
})

export const played = $.css({
  'background-color': 'var(--primary-color)'
})

export const dot = $.css({
  transition: 'transform 0.2s ease',
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
    'background-color': 'var(--primary-color)',
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

export const progress = $.css({
  'box-sizing': 'border-box',
  padding: '5px 0',
  cursor: 'pointer',
  width: '100%',

  [`&:hover .${dot}::before`]: {
    transform: 'scale(1)'
  },

  [`&:hover .${buffered}`]: {
    transform: 'scaleY(1.8)'
  },
  [`&:hover .${played}`]: {
    transform: 'scaleY(1.8)'
  },

  [`&:hover .${hit}`]: {
    opacity: 1
  }
})

export const progressInner = $.css({
  position: 'relative',
  height: '3px',
  width: '100%',
  'background-color': 'rgba(255,255,255,.2)',

  [`& .${buffered},& .${played}`]: {
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    height: '3px',
    'will-change': 'width',
    transition: 'all 0.2s ease',
    'pointer-events': 'none'
  }
})
