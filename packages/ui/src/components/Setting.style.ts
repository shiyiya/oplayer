import { $ } from '@oplayer/core'

export const activeCls = $.css('display: block;')

export const settingCls = (position: 'top' | 'bottom') =>
  $.css({
    'z-index': '8',
    'max-height': '75%',
    'border-radius': '2px',
    display: 'block',
    position: 'absolute',
    right: '1em',
    [position]: position == 'top' ? 'var(--control-bar-height)' : '2.5em',
    overflow: 'auto',
    'background-color': 'var(--shadow-background-color)',
    fill: '#fff',

    '&::-webkit-scrollbar': { width: '2px' },

    '&::-webkit-scrollbar-thumb': {
      background: 'var(--primary-color)'
    },

    // panel
    '& > div': { display: 'none', 'font-size': '0.875em' },

    // active panel
    [`& > div.${activeCls}`]: { display: 'block' }
  })

export const panelCls = $.css('min-width: 15.5em;')

export const subPanelCls = $.css('min-width: 10.5em;')

// √
export const yesIcon = $.css(`
  display: none;
  width: 1.4em;
  height: 1.4em;
`)

// >
export const nextIcon = $.css(`
  width: 2em;
  height: 2em;
  margin: 0 -10px 0 -5px;
`)

// <
export const backIcon = $.css(`
  width: 2em;
  height: 2em;
  transform: rotate(180deg);
  margin-left: -10px;
`)

export const switcherCls = $.css({
  position: 'absolute',
  cursor: 'pointer',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  'background-color': '#ccc',
  transition: '.3s',
  'border-radius': '34px',

  '&:before': {
    position: 'absolute',
    content: '""',
    height: '1em',
    width: '1em',
    left: '0.25em',
    bottom: '0.1875em',
    'background-color': 'white',
    transition: '.3s',
    'border-radius': '50%'
  }
})

export const switcherContainer = $.css(`
  position: relative;
  width: 2.5em;
  height: 1.375em;
`)

// `selectedText` >
export const nextLabelText = $.css(`
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8em;
`)

export const settingItemCls = $.css({
  height: '2.4em',
  cursor: 'pointer',
  color: '#fff',
  'justify-content': 'space-between',
  'align-items': 'center',
  padding: '0 0.75em',
  'line-height': '1',
  display: 'flex',
  overflow: 'hidden',

  '& > *': { 'pointer-events': 'none' },

  '&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  },

  [`&[aria-checked='true']`]: {
    [`& .${yesIcon}`]: { display: 'block' },
    [`&[data-index]`]: {
      'background-color': 'rgba(255, 255, 255, 0.1)'
    },

    [`& .${switcherCls}`]: {
      'background-color': 'var(--primary-color)',

      '&:before': { transform: 'translateX(1em)' }
    }
  }
})

export const settingItemLeft = $.css({
  display: 'flex',
  'align-items': 'center',
  'margin-right': '10px',

  '& > svg': {
    width: '1.7em',
    height: '1.7em',
    'margin-right': '0.5em'
  }
})

export const settingItemRight = $.css(`
  display: flex;
  align-items: center;
`)

export const backRow = $.css({
  width: '100%',
  display: 'flex',
  'align-items': 'center',
  'border-bottom': '1px solid rgb(255 255 255 / 10%)'
})
