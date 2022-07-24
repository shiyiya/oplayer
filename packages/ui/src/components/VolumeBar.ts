import { $ } from '@oplayer/core'
import type Player from '@oplayer/core'

const slider = $.css(`
  position:relative;
  display: flex;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  width: 33px;
  margin: 0 auto;
  height: 70px;
  cursor: pointer;
`)

const thumb = $.css`
  position:absolute;
  bottom: 0;
  top: auto;
  left: -5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--primary-color);
  vertical-align: middle;
  pointer-events: none;
  `

const volumeValue = $.css(`
  color: #e5e9ef;
  width: 100%;
  text-align: center;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
  margin-bottom: 2px;
`)

const volumeSlider = $.css(`
  height: 100%;
  width: 100%;
  background-color: var(--primary-color);
  transform-origin: 0 100%;
`)

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${$.css`
      width: 35px;
      height: 110px;
      background: rgba(21,21,21,.9);
      border-radius: 2px;
      user-select: none;
      `}`,
    {},
    `<div class=${volumeValue}>100</div>

    <div class=${$.css(`
      display: flex;
      vertical-align: middle;
      align-items: center;
      justify-content: center;
      width: 33px;
      margin: 0 auto;
      height: 70px;
    `)}>
      <div class=${slider}>
        <div class=${$.css`
          height: 100%;
          width: 2px;
          align-items: flex-end;
          position: relative;
          display: flex;
          align-items: center;
        `}>
          <div class=${$.css(`
            position: relative;
            border-radius: 1.5px;
            background: #e7e7e7;
            height: 100%;
            width: 2px;
          `)}>
            <div class=${volumeSlider}></div>
          </div>

          <div class=${thumb}></div>
        <div>
      </div>
    </div>`
  )

  const $slider = $dom.querySelector<HTMLDivElement>(`.${slider}`)!
  const $thumb = $dom.querySelector<HTMLDivElement>(`.${thumb}`)!
  const $volumeSlider = $dom.querySelector<HTMLDivElement>(`.${volumeSlider}`)!
  const $volumeValue = $dom.querySelector<HTMLDivElement>(`.${volumeValue}`)!

  const getSlidingValue = (event: MouseEvent) => {
    const rect = $slider.getBoundingClientRect()
    const value = (rect.bottom - event.clientY) / rect.height
    return value >= 1 ? 1 : value <= 0 ? 0 : value
  }

  const sync = (e: MouseEvent) => {
    setter(getSlidingValue(e))
  }

  const setter = (value: number) => {
    $volumeValue.innerText = `${~~(value * 100)}`
    $volumeSlider.style.transform = `scaleY(${value})`
    $thumb.style.bottom = `calc(${~~(value * 100)}% - 6px)`
    player.setVolume(value)
  }

  setter(player.volume)
  player.on('volumechange', () => {
    setter(player.isMuted ? 0 : player.volume)
  })

  $slider.addEventListener('mousedown', (e: MouseEvent) => {
    sync(e)

    document.addEventListener('mousemove', sync, { passive: true })
    document.addEventListener(
      'mouseup',
      () => {
        document.removeEventListener('mousemove', sync)
      },
      { once: true }
    )
  })

  $.render($dom, el)
}

export default render
