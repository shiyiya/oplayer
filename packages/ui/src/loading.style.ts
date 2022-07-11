import { $ } from '@oplayer/core'

const css = $.css

const linearactivity = css({
  overflow: 'hidden',
  width: '20%',
  height: '4px',
  'background-color': 'var(--shadow-color-4)',
  margin: '20px auto',
  'border-radius': '4px',

  '& .determinate': {
    position: 'relative',
    'max-width': '100%',
    height: '100%',
    '-webkit-transition': 'width 500ms ease-out 1s',
    '-moz-transition': 'width 500ms ease-out 1s',
    '-o-transition': 'width 500ms ease-out 1s',
    transition: 'width 500ms ease-out 1s',
    'background-color': '#03a9f4'
  },

  '& .indeterminate': {
    position: 'relative',
    width: '100%',
    height: '100%'
  },

  '& .indeterminate:before': {
    content: "''",
    position: 'absolute',
    height: '100%',
    'background-color': 'var(--primary-color)',
    animation: 'indeterminate_first 1.5s infinite ease-out'
  },

  '& .indeterminate:after': {
    content: "''",
    position: 'absolute',
    height: '100%',
    'background-color': 'rgba(102 104 171 /0.8)',
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
