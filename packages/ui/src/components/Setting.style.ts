import { $ } from '@oplayer/core'
import { settingShown } from '../style'
import { maskCls } from './Mask'

export const activeCls = $.css('display: block;')

export const panelCls = $.css('/*panelCls*/')

export const selectorOptionsPanel = $.css('/*selectorOptionsPanelCls*/')

export const setting = $.css({
  'z-index': '98',
  'max-height': '300px',
  'border-radius': '3px',
  'font-size': '14px',
  display: 'block',
  position: 'absolute',
  right: '10px',
  bottom: '40px',
  'overflow-y': 'auto',
  '-webkit-backdrop-filter': 'saturate(180%) blur(20px)',
  'backdrop-filter': 'saturate(180%) blur(20px)',
  'background-color': 'var(--shadow-background-color)',
  fill: '#fff',
  transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
  visibility: 'hidden',
  'transform-origin': 'bottom right',
  'transition-property': 'all',

  [`@global .${settingShown} &`]: {
    visibility: 'visible'
  },

  [`@global .${settingShown} .${maskCls}`]: {
    'z-index': '98'
  },

  '::-webkit-scrollbar': {
    width: '2px'
  },

  '::-webkit-scrollbar-thumb': {
    background: 'var(--primary-color)'
  },

  [`& > .${panelCls}`]: {
    display: 'none'
  },

  // active panel
  [`& > div.${activeCls}`]: {
    display: 'block'
  }
})

// √
export const yesIcon = $.css(`
  position: absolute;
  right: 10px;
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
  'margin-right': '20px',

  [`@global .${selectorOptionsPanel} & `]: {
    'margin-right': '45px'
  },

  '& > svg': {
    width: '22px',
    'margin-right': '6px'
  }
})

export const settingItemRight = $.css(`
  display: flex;
  align-items: center;
`)
