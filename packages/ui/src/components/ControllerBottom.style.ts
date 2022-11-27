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
    border-radius: 3px;
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
    'padding-top': '0.5em',
    'margin-top': '-0.5em',

    [`& .${expand}`]: {
      visibility: 'visible',
      opacity: 1
    }
  }
})

export const dropItem = $.css({
  'min-width': '6em',
  display: 'block',
  height: '2.4em',
  'line-height': '2.4em',
  cursor: 'pointer',
  'text-align': 'center',
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
    'font-size': '120%'
  },

  [`& .${icon}`]: {
    padding: '0 0.5em',
    width: '2em',
    height: '2em',
    'box-sizing': 'content-box',

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
