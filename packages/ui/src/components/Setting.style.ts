import { $ } from '@oplayer/core'

export const activeCls = $.css('display: block;')

export const setting = $.css({
  'z-index': '99',
  height: 'auto',
  'max-height': '300px',
  'max-width': '200px',
  'border-radius': '3px',
  'font-size': '14px',
  transition: 'all .2s',
  display: 'block',
  position: 'absolute',
  right: '10px',
  bottom: '40px',
  overflow: 'auto',
  'backdrop-filter': 'saturate(180%) blur(20px)',
  'background-color': 'rgba(0, 0, 0, 0.7)',

  // panel
  '& > div': {
    display: 'none'
  },

  // active panel
  [`& > div.${activeCls}`]: {
    display: 'block'
  }
})

export const panelCls = $.css`
  width: 200px;
`

export const subPanelCls = $.css`
  width: 150px;
`

export const settingItemCls = $.css({
  height: '40px',
  cursor: 'pointer',
  color: '#eee',
  'justify-content': 'space-between',
  'align-items': 'center',
  padding: '0 10px',
  'line-height': '1',
  display: 'flex',
  overflow: 'hidden',

  [`&[data-selected='true']`]: {
    'background-color': 'rgba(255, 255, 255, 0.1)',
    color: '#fff'
  }
})

export const switcherCls = $.css({
  display: 'flex',
  height: '100%',
  width: '100%',
  'align-items': 'center',
  'justify-content': 'space-between',

  '& svg': {
    display: 'none',
    width: '18px',
    height: '18px',
    'margin-right': '6px'
  },

  [`&[data-selected=true] svg`]: {
    display: 'block'
  }
})

export const switcher = (name: string) => `
  <div class="${switcherCls}">
    <span>${name}</span>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#fff"></path>
    </svg>
  </div>
`

export const nextOptionCls = $.css({
  display: 'flex',
  height: '100%',
  width: '100%',
  'align-items': 'center',
  'justify-content': 'space-between',

  '& svg': {
    width: '30px',
    height: '30px'
  },

  '& div': {
    display: 'flex',
    'align-items': 'center',

    '& span': {
      'white-space': 'nowrap',
      color: '#ffffff80',
      'margin-right': '5px',
      'font-size': '12px'
    }
  }
})

export const nexter = (name: string) => `
  <div class="${nextOptionCls}">
    <span>${name}</span>
    <div>
      <span role="label"></span>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32">
        <path d="m 12.59,20.34 4.58,-4.59 -4.58,-4.59 1.41,-1.41 6,6 -6,6 z" fill="#fff"></path>
      </svg>
    </div>
  </div>
`
