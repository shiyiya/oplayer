import { $, isMobile } from '@oplayer/core'
import type { UiConfig } from './types'

export const loading = $.cls('loading')

export const playing = $.cls('playing')

export const focused = $.cls('focused')

export const fullscreen = $.cls('fullscreen')

export const settingShown = $.cls('settingShown')

export const hidden = $.css('display:none')

export const controllerHidden = $.css({
  [`.${playing}`]: { cursor: 'none' }
})

export const error = $.cls('error')

export const DATA_CONTEXTMENU_ATTR_NAME = 'data-contextmenu'

export const root = (config: UiConfig) => {
  return $.css(
    Object.assign(
      {
        '--primary-color': `${config.theme!.primaryColor}`,
        '--shadow-background-color': 'rgba(28 ,28 ,28 , .9)',
        '--control-bar-height': config.controlBar ? '2.5em' : 0,

        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',

        'font-size': '16px',

        '&, & > *': {
          '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
        },
        '& [hidden]': { display: 'none' }
      },
      !isMobile && {
        [`&.${fullscreen}`]: { 'font-size': '22px' },
        [`@global .${webFullScreen} &`]: { 'font-size': '22px' }
      }
    )
  )
}

export const webFullScreen = $.css`
  z-index: 9999 !important;
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
  'line-height': 'inherit',
  'text-align': 'inherit',
  width: '100%'
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
        // '&[left]::after': {
        //   transform: 'translateY(0) scale(1)'
        // },
        '&[data-tooltip-pos=up-right]::after': {
          right: 0,
          left: 'auto',
          transform: 'translateY(0) scale(1)'
        },

        '&[data-tooltip-pos=bottom-right]::after': {
          right: 0,
          transform: 'translateY(0) scale(1)'
        }
      },

      '&::after': {
        'line-height': '1.25em',
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
        padding: '4px 8px',
        'border-radius': '4px',
        transition: 'transform .2s ease .1s,opacity .2s ease .1s',
        'pointer-events': 'none',
        'font-size': '0.75em'
      },

      '&[data-tooltip-pos=up-right]::after': {
        right: 0,
        left: 'auto',
        transform: 'translateY(10px) scale(.8)',
        'transform-origin': '100% 100%'
      },

      '&[data-tooltip-pos=bottom-right]::after': {
        right: 0,
        top: '100%',
        bottom: 'unset',
        left: 'auto',
        'margin-top': '0.5em',
        transform: 'translateY(-10px) scale(.8)',
        'transform-origin': '100% 0'
      }
    })
