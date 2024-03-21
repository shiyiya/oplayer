import { $, isMobile } from '@oplayer/core'
import { icon } from '../style'

export const time = $.css`
  font-variant-numeric: tabular-nums;
  font-size: 0.875em;
`

export const live = $.css(
  `width:0.5em;height:0.5em;background-color:var(--primary-color);border-radius:50%;margin-right:0.5em`
)

export const expand = $.css(`
    position: absolute;
    top: 10px;
    right: 50%;
    border-radius: 2px;
    box-sizing: border-box;
    transform: translate(50%, -100%);
    transition: opacity 0.2s ease, top 0.2s ease;
    font-size: 0.875em;
`)

export const expandBottom = $.css(`
    top: calc(100% - 10px);
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
      opacity: 1,
      top: 0
    }
  },
  ['&[data-dropdown-pos=top]:hover']: {
    'padding-bottom': '0.5em',
    'margin-bottom': '-0.5em',

    [`& .${expand}`]: {
      top: '100%'
    }
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

export const withIcon = $.css({
  display: 'flex',
  'align-items': 'center',

  [`& > .${icon}:last-child${
    isMobile ? `, & >  .${icon}[aria-label="Play"], & >  .${icon}[aria-label="Pause"]` : ''
  }`]: {
    'margin-right': 0
  }
})

export const controllers = $.css({
  color: '#fff',
  height: '2.375em',
  display: 'flex',
  'box-sizing': 'border-box',
  'justify-content': 'space-between',
  'align-items': 'center',
  'padding-bottom': isMobile ? 0 : '0.25em',

  [`& .${icon}.${textIcon}`]: {
    width: 'auto',
    'min-width': '2em',
    'font-size': '0.875em',
    padding: '0 4px',
    'border-radius': '2px'
  },

  [`& .${icon}`]: Object.assign(
    {
      width: '2em',
      height: isMobile ? 'auto' : '2em',
      'margin-right': '0.5em',
      'justify-content': 'center',
      'align-items': 'center',
      display: 'inline-flex',

      '& > *': {
        height: '1.5em',
        width: '1.5em',
        'pointer-events': 'none',
        transition: 'transform .2s ease-in-out'
      }
    },

    isMobile
      ? { '&:active > *': { transform: 'scale(.9)' } }
      : { '&:hover': { 'background-color': 'rgb(255 255 255 / .2)' } }
  )
})

export const centerProgressWrap = $.css({
  flex: 1,
  height: '100%',
  'padding-left': '0.5em',
  '> div': {
    height: '100%',
    display: 'flex',
    'align-items': 'center'
  }
})
