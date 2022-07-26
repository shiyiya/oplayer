import type { Player } from '@oplayer/core'
import { $ } from '@oplayer/core'
import { initListener } from '../utils'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;`}`,
    {},
    `<div class=${$.css({
      overflow: 'hidden',
      width: '20%',
      height: '4px',
      'background-color': 'var(--shadow-color-4)',
      'border-radius': '4px'
    })}>
      <div class="${$.css({
        '&': {
          position: 'relative',
          width: '100%',
          height: '100%',
          '-webkit-transition': 'width 500ms ease-out 1s',
          '-moz-transition': 'width 500ms ease-out 1s',
          '-o-transition': 'width 500ms ease-out 1s',
          transition: 'width 500ms ease-out 1s'
        },

        '&::before,&::after': {
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
      })}"></div>
    </div>
    `
  )

  $.render($dom, el)

  let lastTime = 0
  let currentTime = 0
  let bufferingDetected = false
  let enable = player.isAutoPlay

  initListener.listener(
    player,
    () => {
      currentTime = lastTime = 0
      $dom.style.display = 'flex'
    },
    () => {
      if (!player.isPlaying) {
        $dom.style.display = 'none'
      }
    }
  )

  player.on(['videosourcechange', 'pause', 'play'], (e) => {
    enable = e.type != 'pause'
  })

  player.on('seeking', () => {
    if (!player.isPlaying) {
      $dom.style.display = 'flex'

      player.on(
        'canplaythrough',
        () => {
          $dom.style.display = 'none'
        },
        { once: true }
      )
    }
  })

  setInterval(() => {
    if (enable) {
      currentTime = player.currentTime

      // loading
      if (
        !bufferingDetected &&
        currentTime === lastTime &&
        (player.isPlaying || !initListener.isInit())
      ) {
        $dom.style.display = 'flex'
        bufferingDetected = true
      }

      if (
        bufferingDetected &&
        currentTime > lastTime &&
        (player.isPlaying || !initListener.isInit())
      ) {
        $dom.style.display = 'none'
        bufferingDetected = false
      }
      lastTime = currentTime
    }
  }, 100)
}

export default render
