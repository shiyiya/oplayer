import { $ } from '@oplayer/core'

const css = $.css

const linearactivity = css({
  overflow: 'hidden',
  width: '20%',
  height: '4px',
  'background-color': 'var(--shadow-color-4)',
  'border-radius': '4px',

  '& .indeterminate': {
    position: 'relative',
    width: '100%',
    height: '100%',
    '-webkit-transition': 'width 500ms ease-out 1s',
    '-moz-transition': 'width 500ms ease-out 1s',
    '-o-transition': 'width 500ms ease-out 1s',
    transition: 'width 500ms ease-out 1s'
  },

  '& .indeterminate::before,& .indeterminate::after': {
    display: 'block',
    content: "''",
    position: 'absolute',
    height: '100%',
    'background-color': 'var(--primary-color)'
  },

  '& .indeterminate::before': {
    animation: 'indeterminate_first 1.5s infinite ease-out'
  },

  '& .indeterminate::after': {
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

export default linearactivity
