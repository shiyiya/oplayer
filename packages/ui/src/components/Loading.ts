import { $ } from '@oplayer/core'
import { Player, PlayerEvent } from '@oplayer/core'

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      position: absolute;
      inset: 0;
      display: flex;
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

  let isInit = false

  player.on(
    [
      'play',
      'pause',
      'seeking',
      'waiting',
      'canplaythrough',
      'videosourcechange',
      'durationchange'
    ],
    (e: PlayerEvent) => {
      // 第一次能播放  移动端 canplaythrough 后还不能播放，使用 durationchange
      if (e.type == 'durationchange' && !isInit) {
        isInit = true
        $dom.style.display = 'none'
        return
      }

      if ('videosourcechange' == e.type) {
        isInit = false
        $dom.removeAttribute('style')
        return
      }

      // durationchange 之后 loading 逻辑
      if (isInit) {
        if (player.isLoading && player.isPlaying) {
          $dom.removeAttribute('style')
        } else {
          $dom.style.display = 'none'
        }
      }
    }
  )
}

export default render
