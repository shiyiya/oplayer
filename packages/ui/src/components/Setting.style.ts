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
  fill: '#fff',

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

// √
export const yesIcon = $.css(`
  display: none;
  width: 18px;
  height: 18px;
  margin-right: 6px;
`)

// >
export const nextIcon = $.css(`
  width: 30px;
  height: 30px;
`)

// `selectedText` >
export const nextLabelText = $.css(`
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px
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

  '&:hover': {
    'background-color': 'rgba(255, 255, 255, 0.1)'
  },

  [`&[data-selected='true']`]: {
    'background-color': 'rgba(255, 255, 255, 0.1)',
    color: '#fff',

    [`& .${yesIcon}`]: {
      display: 'block'
    }
  }
})

export const settingItemLeft = $.css({
  display: 'flex',
  'align-items': 'center',

  '& > svg': {
    width: '22px',
    'margin-right': '6px'
  }
})

export const settingItemRight = $.css(`
  display: flex;
  align-items: center;
`)
