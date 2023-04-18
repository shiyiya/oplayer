import { Player, PlayerPlugin, $ } from '@oplayer/core'

const topRight = $.css({
  position: 'absolute',
  right: '0.5em',
  top: '0.5em',
  'z-index': 1
})

const area = $.css(
  'display: inline-block;background: rgba(28 ,28 ,28 , 0.9);color: #fff;padding: 4px 8px;border-radius: 4px; fill:#fff; font-size: 14px'
)

const mute = $.css({
  position: 'relative',
  '&::before': {
    display: 'block',
    content: "''",
    position: 'absolute',
    width: '50%',
    height: '2px',
    'background-color': '#fff',
    transform: 'rotate(40deg) translateY(-100%)',
    top: '48%',
    left: '6px'
  }
})

type Options = {
  video?: string
  image?: string
  autoplay?: boolean
  plugins?: PlayerPlugin[]
  skipDuration?: number
  duration: number
  target?: string
  onSkip?: (duration: number) => void
}

export default ({
  duration,
  skipDuration,
  video,
  image,
  plugins,
  target,
  autoplay,
  onSkip
}: Options): PlayerPlugin => ({
  name: 'oplayer-plugin-ad',
  version: __VERSION__,
  apply: (player) => {
    if (autoplay) {
      bootstrap()
    } else {
      $.render(
        $.create(
          `div.${$.css({
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '0',
            left: '0',
            'z-index': 999
          })}`
        ),
        player.$root
      ).onclick = function () {
        ;(this as HTMLDivElement).remove()
        bootstrap()
      }
    }

    function bootstrap() {
      const $container = $.create(
        `div.${$.css({
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '0',
          left: '0',
          'z-index': 999,
          cursor: 'pointer'
        })}`,
        {},
        `<div class=${topRight}>
            ${
              skipDuration
                ? `<div class=${area} skipDuration>${player.locales.get(
                    'Can be closed after %ss',
                    skipDuration
                  )}</div>`
                : ''
            }

            <div class=${area} duration>${player.locales.get('%ss', duration)}</div>

            ${
              video
                ? `
               <div class='${area} ${mute}' volume>
                <svg width="1em" height="1em" viewBox="0 0 1024 1024" version="1.1">
                  <path d="M552.96 152.064v719.872c0 16.118-12.698 29.184-28.365 29.184a67.482 67.482 0 0 1-48.394-20.644L329.359 729.354a74.547 74.547 0 0 0-53.493-22.794H250.47c-104.386 0-189.03-87.101-189.03-194.56s84.644-194.56 189.03-194.56h25.396c20.07 0 39.3-8.192 53.473-22.794L476.18 143.503a67.482 67.482 0 0 1 48.436-20.623c15.646 0 28.344 13.066 28.344 29.184z m216.965 101.58a39.936 39.936 0 0 1 0-57.425 42.25 42.25 0 0 1 58.778 0c178.483 174.408 178.483 457.154 0 631.562a42.25 42.25 0 0 1-58.778 0 39.936 39.936 0 0 1 0-57.405 359.506 359.506 0 0 0 0-516.752zM666.542 373.884a39.731 39.731 0 0 1 0-55.235 37.52 37.52 0 0 1 53.944 0c104.305 106.783 104.305 279.921 0 386.704a37.52 37.52 0 0 1-53.944 0 39.731 39.731 0 0 1 0-55.235c74.486-76.288 74.486-199.946 0-276.234z" />
                </svg>
              </div>`
                : ''
            }
          </div>
          </div>
        `
      )

      let instance: Player
      const $skip = $container.querySelector<HTMLDivElement>(`.${area}[skipDuration]`)
      const $duration = $container.querySelector<HTMLDivElement>(`.${area}[duration]`)!
      const $volume = $container.querySelector<HTMLDivElement>(`.${area}[volume]`)

      if (video) {
        instance = Player.make($container, {
          muted: true,
          autoplay: true,
          loop: true,
          source: { src: video }
        })
          .use(plugins || ([] as any))
          .create()

        $volume!.addEventListener('click', () => {
          instance.isMuted ? instance.unmute() : instance.mute()
          $volume!.classList.toggle(mute)
        })
      } else {
        $container.style.background = `url(${image}) center center`
      }
      $.render($container, player.$root)

      let count = 0

      const destroy = () => {
        clearInterval(timer)
        instance?.destroy()
        $container.remove()
        player.play()
      }

      //TODO: fix hotkey
      const timer = setInterval(() => {
        if (skipDuration !== undefined) {
          count++

          if (skipDuration - count > -1) {
            $skip!.innerText = player.locales.get('Can be closed after %ss', skipDuration - count)
          } else {
            $skip!.innerText = player.locales.get('Close')
            $skip!.onclick ??= () => {
              onSkip?.(count)
              destroy()
            }
          }
        }

        if (duration - count > -1) {
          $duration.innerText = player.locales.get('%ss', duration - count)
        } else {
          destroy()
        }
      }, 1000)

      if (target) {
        $container.addEventListener('click', (e) => {
          if (!(e.target as HTMLElement).classList.contains(area)) {
            window.open(target, '_blank')
          }
        })
      }
    }
  }
})
