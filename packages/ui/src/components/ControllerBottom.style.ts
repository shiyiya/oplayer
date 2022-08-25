import { $ } from '@oplayer/core'
import { icon } from '../style'
import { isMobile } from '../utils'

export const time = $.css`
  padding: ${isMobile ? 0 : '0px 0.5em'};
  font-variant-numeric: tabular-nums;
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
    font-size: 12px;
    transition: visibility 0s, opacity 0.1s linear;
`)

export const dropdown = $.css({
  position: 'relative',
  'line-height': '100%'
})

export const dropdownHoverable = $.css({
  position: 'relative',
  'line-height': '100%',

  [`& .${expand}`]: {
    visibility: 'hidden',
    opacity: 0,
    'background-color': 'rgba(21, 21, 21, .9)'
  },

  ['&:hover']: {
    'padding-top': '4px',
    'margin-top': '-4px',

    [`& .${expand}`]: {
      visibility: 'visible',
      opacity: 1
    }
  }
})

export const dropitem = $.css({
  display: 'block',
  padding: '6px 15px',
  cursor: 'pointer',
  'font-size': '14px',
  'text-align': 'center',
  'border-radius': '4px',
  'margin-bottom': '2px',
  transition: 'color .2s',

  '&:nth-last-child(1)': {
    'margin-bottom': '0px'
  },

  '& *': {
    'pointer-events': 'none'
  },

  '&[data-selected=true]': {
    color: 'var(--primary-color)'
  },

  '&[data-selected=true],&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  }
})

export const controllerBottom = $.css({
  display: 'flex',
  'justify-content': 'space-between',
  'font-size': '14px',
  color: '#fff',
  fill: '#fff',
  height: '35px',
  padding: isMobile ? 0 : '0px 0px 5px 0px',
  'margin-right': isMobile ? '-9px' : '0px',
  'text-align': 'center',

  [`& .${expand} .${icon}[aria-label="WebFullscreen"]`]: {
    width: '25px',
    height: '20px',
    'margin-top': '2px'
  },

  [`& .${icon}`]: {
    width: '36px',
    height: '22px',

    ['> svg']: {
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
