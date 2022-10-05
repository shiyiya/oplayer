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
    display: 'flex!important'
  }
})

export const loading = $.css({
  overflow: 'hidden',
  width: '20%',
  height: '4px',
  'background-color': 'var(--primary-color-4)',
  'border-radius': '4px'
})

export const line = $.css({
  '&': {
    position: 'relative',
    width: '100%',
    height: '100%',
    '-webkit-transition': 'width 500ms ease-out 1s',
    '-moz-transition': 'width 500ms ease-out 1s',
    '-o-transition': 'width 500ms ease-out 1s',
    transition: 'width 500ms ease-out 1s'
  },

  '&::before, &::after': {
    display: 'block',
    content: "''",
    position: 'absolute',
    height: '100%',
    'background-color': 'var(--primary-color)'
  },

  '&::before': {
    animation: 'indeterminate_first 1.5s infinite ease-out'
  },

  '&::after': {
    animation: 'indeterminate_second 1.5s infinite ease-in'
  },

  '@keyframes indeterminate_first': {
    '0%': {
      left: '-100%',
      width: '100%'
    },
    '100%': {
      left: '100%',
      width: '10%'
    }
  },

  '@keyframes indeterminate_second': {
    '0%': {
      left: '-150%',
      width: '100%'
    },
    '100%': {
      left: '100%',
      width: '10%'
    }
  }
})
