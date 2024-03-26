import { $, isMobile } from '@oplayer/core'
import { controllerHidden } from '../style'
import { thumbnailCls, vttThumbnailsCls } from './Thumbnail'

export const buffered = $.css({
  'background-color': 'hsla(0, 0%, 100%, 0.4)'
})

export const played = $.css({
  'background-color': 'var(--primary-color)'
})

export const dot = $.css({
  'pointer-events': 'none',
  position: 'relative',

  '& > *': {
    display: 'block',
    position: 'absolute',
    width: '1.4em',
    height: '1.4em',
    top: '0',
    left: '0',
    margin: '-0.535em 0 0 -0.7em',
    transform: isMobile ? 'none' : 'scale(0)',
    transition: 'transform 0.3s ease',
    'z-index': '1'
  },

  '& > *:not(svg)': {
    width: '1em',
    height: '1em',
    margin: '-0.335em 0 0 -0.5em',
    'border-radius': '50%',
    'background-color': '#fff'
  }
})

export const hit = $.css({
  position: 'absolute',
  left: '0',
  'border-radius': '2px',
  padding: '6px 8px',
  'background-color': 'var(--shadow-background-color)',
  color: '#fff',
  'z-index': '2',
  'pointer-events': 'none',
  transform: 'translateX(-50%)',
  display: 'none',
  bottom: '15px'
})

export const progressDragging = $.css('/* progressDragging */')

export const progress = $.css(
  Object.assign(
    {
      position: 'relative',
      'box-sizing': 'border-box',
      padding: '0.5em',
      cursor: 'pointer',
      width: '100%',
      'font-size': '0.75em',
      transition: 'padding 0.3s ease',

      [`&.${progressDragging} .${hit}, &.${progressDragging} .${thumbnailCls}, &.${progressDragging} .${vttThumbnailsCls}`]:
        {
          display: 'block'
        }
    },
    isMobile
      ? {
          [`@global .${controllerHidden} .${dot} > *`]: {
            transform: 'scale(0)'
          }
        }
      : {
          [`&.${progressDragging} .${dot} > *, &:hover .${dot} > *`]: {
            transform: 'scale(1)'
          }
        }
  )
)

export const progressInner = $.css({
  position: 'relative',
  height: '0.33em',
  width: '100%',
  'background-color': 'hsla(0, 0%, 100%, 0.2)',
  'border-radius': '1em',

  [`& .${buffered}, & .${played}`]: {
    'border-radius': '1em',
    overflow: 'hidden',
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    'pointer-events': 'none'
  }
})
