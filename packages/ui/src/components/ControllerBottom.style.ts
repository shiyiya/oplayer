import { $, isMobile } from '@oplayer/core'
import { icon } from '../style'

export const time = $.css`
  font-variant-numeric: tabular-nums;
  font-size: 0.875em;
  margin-top: 2px;
`

export const live = $.css(
  `width:0.5em;height:0.5em;background-color:var(--primary-color);border-radius:50%;margin-right:0.5em`
)

export const expand = $.css(`
    position: absolute;
    top: 0;
    right: 50%;
    border-radius: 2px;
    box-sizing: border-box;
    transform: translate(50%, -100%);
    transition: visibility 0s, opacity 0.1s linear;
    font-size: 0.875em;
`)

export const expandBottom = $.css(`
    top: 100%;
    right: 50%;
    transform: translateX(50%);
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
  },
  ['&[data-dropdown-pos=top]:hover']: {
    'padding-bottom': '0.5em',
    'margin-bottom': '-0.5em'
  }
})

export const dropItem = $.css({
  padding: '0 0.5em',
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

  '&[aria-checked=true]': {
    color: 'var(--primary-color)'
  },

  '&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  }
})

export const textIcon = $.cls('textIcon')

export const controllerBottom = $.css({
  color: '#fff',
  fill: '#fff',
  height: '2.5em',
  display: 'flex',
  'box-sizing': 'border-box',
  'justify-content': 'space-between',
  'align-items': 'center',
  'padding-bottom': isMobile ? 0 : '4px',
  margin: '0 -6px',

  [`& .${icon}.${textIcon}`]: {
    width: 'auto',
    'min-width': '2em',
    'font-size': '0.875em'
  },

  [`& .${icon}`]: {
    padding: '0 0.5em',
    width: '1.25em',
    height: '1.5em',
    'line-height': '1.5em',
    'box-sizing': 'content-box',

    '& > *': {
      height: '1.5em',
      width: '1.5em',
      'pointer-events': 'none',
      transition: 'transform .2s ease-in-out'
    },

    '&:active > *': { transform: 'scale(.85)' }
  },

  // left & right
  '> div': {
    display: 'flex',
    'align-items': 'center',
    [`&:nth-child(1) .${icon} `]: {
      'padding-left': 0
    }
  }
})
