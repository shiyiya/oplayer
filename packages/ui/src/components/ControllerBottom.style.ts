import { $, isMobile } from '@oplayer/core'
import { icon } from '../style'

export const time = $.css`
  padding: ${isMobile ? 0 : '0px 0.5em'};
  font-variant-numeric: tabular-nums;
  font-size: 120%;
`

export const expand = $.css(`
    position: absolute;
    top: 0;
    right: 50%;
    z-index: 10;
    padding: 4px;
    border-radius: 4px;
    box-sizing: border-box;
    transform: translate(50%, -100%);
    transition: visibility 0s, opacity 0.1s linear;
    font-size: 120%;
`)

export const dropdown = $.css({
  position: 'relative',
  display: 'flex',

  [`& .${expand}`]: {
    visibility: 'hidden',
    opacity: 0,
    'background-color': 'var(--shadow-background-color)'
  }
})

export const dropdownHoverable = $.css({
  ['&:hover']: {
    'padding-top': '4px',
    'margin-top': '-4px',

    [`& .${expand}`]: {
      visibility: 'visible',
      opacity: 1
    }
  }
})

export const dropItem = $.css({
  display: 'block',
  padding: '0.45em 1.2em',
  cursor: 'pointer',
  'text-align': 'center',
  'border-radius': '4px',
  'margin-bottom': '2px',
  transition: 'color .2s',
  'word-break': 'keep-all',

  '&:nth-last-child(1)': {
    'margin-bottom': '0px'
  },

  '& *': {
    'pointer-events': 'none'
  },

  '&[data-selected=true]': {
    color: 'var(--primary-color)'
  },

  '&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  }
})

export const controllerBottom = $.css({
  display: 'flex',
  'justify-content': 'space-between',
  color: '#fff',
  fill: '#fff',
  height: 'var(--controller-Bottom-height)',
  padding: isMobile ? 0 : '0px 0px 5px 0px',
  'margin-right': isMobile ? '-8px' : '0px',
  'text-align': 'center',

  [`& .${icon}.--text`]: {
    width: 'auto',
    margin: '0 8px',
    'font-size': '120%'
  },

  [`& .${icon}`]: {
    width: '3em',
    height: '1.9em',

    ['& svg']: {
      width: '100%',
      height: '100%',
      'pointer-events': 'none'
    }
  },

  // left & right
  '> div': {
    display: 'flex',
    'align-items': 'center'
  }
})
