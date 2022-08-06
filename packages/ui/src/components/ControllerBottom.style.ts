import { $ } from '@oplayer/core'
import { icon } from '../style'
import { isMobile } from '../utils'

export const controllerBottom = $.css({
  display: 'flex',
  'justify-content': 'space-between',
  'font-size': '14px',
  color: 'hsla(0, 0%, 100%, .8)',
  fill: 'hsla(0, 0%, 100%, .9)',
  height: '30px',
  padding: isMobile ? 0 : '5px 0px',
  'line-height': '22px',
  'text-align': 'center',

  [`& .${icon}[data-value='false']`]: {
    opacity: 0.6
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
    'align-items': 'center',

    '> div:hover, > button:hover': {
      color: '#fff',
      fill: '#fff'
    }
  }
})

export const time = $.css`
  padding: ${isMobile ? 0 : '0px 0.5em'};
  min-width: 100px;
  color: rgba(255, 255, 255, 0.9);
  font-variant-numeric: tabular-nums;
`

export const expand = $.css(`
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    padding: 4px;
    border-radius: 4px;
    box-sizing: border-box;
    transform: translate(0%, -100%);
    background-color: rgba(21, 21, 21, .9);
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.1s linear;
`)

export const dropdown = $.css({
  position: 'relative',
  'line-height': '100%',

  [`&:hover .${expand}`]: {
    visibility: 'visible',
    opacity: 1
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
    'background-color': '#ffffff1a'
  }
})
