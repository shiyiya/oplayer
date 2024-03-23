import { $, isMobile } from '@oplayer/core'
import type { UiConfig } from './types'

// data-loading="true"
export const loading = $.cls('loading')

// data-playing="true"
export const playing = $.cls('playing')

// data-focused="true"
export const focused = $.cls('focused')

// data-screen="web" "full"
export const fullscreen = $.cls('fullscreen')

// data-setting-hidden="true"
export const settingShown = $.cls('settingShown')

export const hidden = $.css('display:none')

export const DATA_CONTROLLER_HIDDEN = 'data-ctrl-hidden'
export const controllerHidden = $.css({
  [`.${playing}`]: { cursor: 'none' }
})

// data-error="true"
export const error = $.cls('error')

// data-contextmenu="true"
export const DATA_CONTEXTMENU_ATTR_NAME = 'data-contextmenu'

export const root = (config: UiConfig) => {
  return $.css(
    Object.assign(
      {
        '--primary-color': `${config.theme!.primaryColor}`,
        '--shadow-background-color': 'rgba(28 ,28 ,28 , .9)',
        '--control-bar-height': config.theme!.controller?.display ? '2.5em' : 0,

        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        'line-height': 1,

        'font-size': isMobile ? '16px' : '18px',

        '&, & > *': {
          '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        },
        '& [hidden]': { display: 'none' }
      },
      {
        [`@global .${webFullScreen} &`]: {
          'font-size': isMobile ? '18px' : '22px'
        },
        [`@global .${fullscreen} &`]: {
          'font-size': isMobile ? '18px' : '22px'
        }
      }
    )
  )
}

export const webFullScreen = $.css`
  z-index: 99 !important;
  position: fixed !important;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;`

export const icon = $.css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
  font: 'inherit',
  color: 'inherit',
  fill: '#fff',
  'line-height': 'inherit',
  'text-align': 'inherit',
  width: '100%',
  '-webkit-tap-highlight-color': 'transparent',
  'user-select': 'none'
})

export const on = $.css({
  '& > *:nth-child(1)': {
    display: 'none'
  }
})

export const off = $.css({
  '& > *:nth-child(2)': {
    display: 'none'
  }
})

export const tooltip = isMobile
  ? ''
  : $.css({
      position: 'relative',

      '&:hover': {
        '&::after': {
          opacity: 1,
          transform: 'translateX(-50%) scale(1)'
        },

        '&:not([data-tooltip-pos]):last-child::after': {
          right: 0,
          left: 'auto',
          transform: 'translateY(0) scale(1)'
        },

        '&[data-tooltip-pos=down]::after': {
          transform: 'translateX(-50%) scale(1)'
        },

        '&[data-tooltip-pos=down]:last-child::after': {
          right: 0,
          transform: 'translateY(0) scale(1)'
        }
      },

      '&::after': {
        position: 'absolute',
        content: 'attr(aria-label)',
        bottom: '100%',
        left: '50%',
        'margin-bottom': '0.5em',
        'white-space': 'nowrap',
        background: 'var(--shadow-background-color)',
        transform: 'translate(-50%, 10px) scale(.8)',
        'transform-origin': '50% 100%',
        opacity: 0,
        padding: '6px 8px',
        'border-radius': '2px',
        transition: 'transform .2s ease .1s,opacity .2s ease .1s',
        'pointer-events': 'none',
        'font-size': '0.75em'
      },

      '&[data-tooltip-pos=down]::after': {
        top: '100%',
        bottom: 'auto',
        'margin-top': '0.5em',
        transform: 'translate(-50%, -10px) scale(.8)'
      },

      '&[data-tooltip-pos=down]:last-child::after': {
        right: 0,
        top: '100%',
        bottom: 'unset',
        left: 'auto',
        'margin-top': '0.5em',
        transform: 'translateY(-10px) scale(.8)',
        'transform-origin': '100% 0'
      },

      '&:not([data-tooltip-pos]):last-child::after': {
        right: 0,
        left: 'auto',
        transform: 'translateY(10px) scale(.8)',
        'transform-origin': '100% 100%'
      }
    })
