import type { Player } from '@oplayer/core'
import { $ } from '@oplayer/core'
import initListener from '../listeners/init'
import { addClass, removeClass } from '../utils'
import { line, loading, wrap } from './Loading.style'

const showCls = $.css('display: flex;')

const render = (player: Player, el: HTMLElement) => {
  const $dom = $.create(
    `div.${wrap}`,
    {},
    `<div class=${loading}>
      <div class="${line}"></div>
    </div>
    `
  )

  $.render($dom, el)

  const show = () => addClass($dom, showCls)
  const hide = () => removeClass($dom, showCls)

  let lastTime = 0
  let currentTime = 0
  let bufferingDetected = false
  let enable = player.isAutoPlay

  initListener.add(() => {
    currentTime = lastTime = 0
    show()
  }, hide)

  player.on(['videosourcechange', 'pause', 'play', 'ended'], (e) => {
    enable = e.type != 'pause'
  })

  player.on('seeking', () => {
    if (!player.isPlaying) {
      show()
      player.on('canplaythrough', hide, { once: true })
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
        show()
        bufferingDetected = true
      }

      if (
        bufferingDetected &&
        currentTime > lastTime &&
        (player.isPlaying || !initListener.isInit())
      ) {
        hide()
        bufferingDetected = false
      }
      lastTime = currentTime
    }
  }, 100)
}

export default render
