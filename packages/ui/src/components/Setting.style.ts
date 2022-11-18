import { $ } from '@oplayer/core'

export const activeCls = $.css('display: block;')

export const setting = $.css({
  'z-index': '98',
  'max-height': '75%',
  'border-radius': '3px',
  display: 'block',
  position: 'absolute',
  right: '1.25em',
  bottom: '3.5em',
  overflow: 'auto',
  'background-color': 'var(--shadow-background-color)',
  fill: '#fff',

  '&::-webkit-scrollbar': { width: '2px' },

  '&::-webkit-scrollbar-thumb': {
    background: 'var(--primary-color)'
  },

  // panel
  '& > div': { display: 'none', 'font-size': '120%' },

  // active panel
  [`& > div.${activeCls}`]: { display: 'block' }
})

export const panelCls = $.css('min-width: 15.5em;')

export const subPanelCls = $.css('min-width: 10.5em;')

// √
export const yesIcon = $.css(`
  display: none;
  width: 18px;
  height: 18px;
`)

// >
export const nextIcon = $.css(`
  width: 30px;
  height: 30px;
  margin: 0 -10px 0 -5px;
`)

// <
export const BackIcon = $.css(`
  width: 30px;
  height: 30px;
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
    height: '16px',
    width: '16px',
    left: '4px',
    bottom: '3px',
    'background-color': 'white',
    transition: '.3s',
    'border-radius': '50%'
  }
})

export const switcherContainer = $.css(`
  position: relative;
  width: 40px;
  height: 22px;
`)

// `selectedText` >
export const nextLabelText = $.css(`
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
  font-size: 80%;
`)

export const settingItemCls = $.css({
  height: '2.4em',
  cursor: 'pointer',
  color: '#fff',
  'justify-content': 'space-between',
  'align-items': 'center',
  padding: '0 10px',
  'line-height': '1',
  display: 'flex',
  overflow: 'hidden',

  '& > *': { 'pointer-events': 'none' },

  '&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  },

  [`&[data-selected='true']`]: {
    [`& .${yesIcon}`]: { display: 'block' },
    [`&[data-index]`]: {
      'background-color': 'rgba(255, 255, 255, 0.1)'
    },

    [`& .${switcherCls}`]: {
      'background-color': 'var(--primary-color)',

      '&:before': { transform: 'translateX(16px)' }
    }
  }
})

export const settingItemLeft = $.css({
  display: 'flex',
  'align-items': 'center',
  'margin-right': '10px',

  '& > svg': {
    width: '22px',
    'margin-right': '6px'
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
