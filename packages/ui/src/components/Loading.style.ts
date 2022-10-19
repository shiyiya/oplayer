import { $ } from '@oplayer/core'
import { loading as globalLoading } from '../style'

export const wrap = $.css({
  position: 'absolute',
  top: '0',
  bottom: '0',
  left: '0',
  right: '0',
  display: 'none',
  'align-items': 'center',
  'justify-content': 'center',

  [`@global .${globalLoading} &`]: {
    display: 'flex'
  }
})

export const line = $.css({
  position: 'relative',
  overflow: 'hidden',
  width: '20%',
  height: '4px',
  'border-radius': '4px',

  '&::before,&::after': {
    display: 'block',
    content: "''",
    position: 'absolute',
    height: '100%',
    width: '100%',
    'background-color': 'var(--primary-color)',
    'border-radius': '4px'
  },

  '&::before': {
    opacity: '0.4'
  },

  '&::after': {
    animation: 'indeterminate 1.3s infinite linear',
    'transform-origin': '0% 50%'
  },

  '@keyframes indeterminate': {
    '0%': {
      transform: 'translateX(0) scaleX(0)'
    },
    '10%': {
      transform: 'translateX(0) scaleX(0.2)'
    },
    '40%': {
      transform: 'translateX(0) scaleX(0.7)'
    },
    '60%': {
      transform: 'translateX(60%) scaleX(0.4)'
    },
    '100%': {
      transform: 'translateX(100%) scaleX(0.2)'
    }
  }
})
