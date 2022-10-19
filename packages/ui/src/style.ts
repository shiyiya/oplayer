import { $, isMobile } from '@oplayer/core'
import type { UiConfig } from './types'

export const settingShown = $.css('/* settingShown */')

export const root = (theme: UiConfig['theme']) => {
  return $.css({
    '--primary-color': `${theme!.primaryColor}`,

    //TODO: more
    '--shadow-background-color': 'rgba(28 ,28 ,28 , .9)',

    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    left: '0',

    '&, & > *': {
      '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
    }
  })
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

export const controllerHidden = $.css('/* controllerHidden */')

export const on = $.css({
  '& > svg:nth-child(1)': {
    display: 'none'
  }
})

export const off = $.css({
  '& > svg:nth-child(2)': {
    display: 'none'
  }
})

export const loading = $.cls('/* loading */')

export const initialized = $.cls('/* isInitialized */')

export const playing = $.cls('/* playing */')

export const focused = $.cls('/* focused */')

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
        }
      },

      '&::after': {
        position: 'absolute',
        content: 'attr(aria-label)',
        bottom: '100%',
        left: '50%',
        'margin-bottom': '5px',
        'white-space': 'nowrap',
        background: 'var(--shadow-background-color)',
        transform: 'translate(-50%, 10px) scale(.8)',
        'transform-origin': '50% 100%',
        opacity: 0,
        'font-size': '12px',
        padding: '4px 8px',
        'border-radius': '4px',
        transition: 'transform .2s ease .1s,opacity .2s ease .1s',
        'pointer-events': 'none'
      },

      '&[data-tooltip-pos=up-right]::after': {
        right: 0,
        left: 'auto',
        transform: 'translateY(10px) scale(.8)',
        'transform-origin': '100% 100%'
      }
    })
