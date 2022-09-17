import { $ } from '@oplayer/core'

export const activeCls = $.css('display: block;')

export const setting = $.css({
  'z-index': '98',
  'max-height': '300px',
  'border-radius': '3px',
  'font-size': '14px',
  display: 'block',
  position: 'absolute',
  right: '15px',
  bottom: '40px',
  overflow: 'auto',
  '-webkit-backdrop-filter': 'saturate(180%) blur(20px)',
  'backdrop-filter': 'saturate(180%) blur(20px)',
  'background-color': 'var(--shadow-background-color)',
  fill: '#fff',

  '@media only screen and (max-width: 768px)': {
    '&': {
      'max-height': '140px'
    }
  },

  '::-webkit-scrollbar': {
    width: '2px'
  },

  '::-webkit-scrollbar-thumb': {
    background: 'var(--primary-color)'
  },

  // panel
  '& > div': {
    display: 'none'
  },

  // active panel
  [`& > div.${activeCls}`]: {
    display: 'block'
  }
})

export const panelCls = $.css(`
  min-width: 220px;
`)

export const subPanelCls = $.css(`
  min-width: 150px;
`)

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

// `selectedText` >
export const nextLabelText = $.css(`
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px
`)

// `switcherText` >
export const switcherText = $.css(`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-right: 4px;
`)

export const settingItemCls = $.css({
  height: '35px',
  cursor: 'pointer',
  color: '#eee',
  'justify-content': 'space-between',
  'align-items': 'center',
  padding: '0 10px',
  'line-height': '1',
  display: 'flex',
  overflow: 'hidden',

  '& > *': {
    'pointer-events': 'none'
  },

  '&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  },

  [`&[data-selected='true']`]: {
    'background-color': 'rgba(255, 255, 255, 0.1)',
    color: '#fff',

    [`& .${yesIcon}`]: {
      display: 'block'
    },

    [`& .${switcherText}`]: {
      display: 'none'
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
