import { $, mergeDeep } from '@oplayer/core'
import { root } from './style'

import {
  Icons,
  registerKeyboard,
  registerSpeedSetting,
  registerSlide,
  registerFullScreenRotation
} from './functions'
import startListening, { loadingListener } from './listeners'

import renderController from './components/Controller'
import renderCoverButton from './components/CoverButton'
import renderError from './components/Error'
import renderLoading from './components/Loading'
import renderMask from './components/Mask'
import renderMenubar from './components/Menubar'
import renderNotice from './components/Notice'
import renderSetting from './components/Setting'
import renderSubtitle, { Subtitle } from './components/Subtitle'
import { render as renderLayer } from './components/layer'
import { ICONS_MAP } from './functions/icons'

import type { PartialRequired, Player } from '@oplayer/core'
import type { Highlight, MenuBar, Setting, Thumbnails, UiConfig, UIInterface } from './types'

const defaultConfig: UiConfig = {
  theme: {
    primaryColor: '#6668ab',
    progress: { position: 'top', mini: true },
    controller: {
      setting: 'auto',
      display: 'always',
      coverButton: true,
      displayBehavior: 'hover'
    }
  },

  fullscreen: true,
  autoFocus: true,
  forceLandscapeOnFullscreen: true,
  settings: ['loop'],
  keyboard: { focused: true },
  speeds: ['2.0', '1.5', '1.25', '1.0', '0.75', '0.5']
}

class UI implements UIInterface {
  key = 'ui'
  version = __VERSION__
  name = 'oplayer-theme-ui'

  player!: Player

  $root!: HTMLDivElement

  $coverButton?: HTMLDivElement

  $controllerBar?: HTMLDivElement | undefined

  $controllerBottom!: HTMLDivElement

  $mask!: HTMLDivElement

  $setting!: HTMLDivElement

  $subtitle!: HTMLDivElement

  icons!: typeof ICONS_MAP

  subtitle!: Subtitle

  notice!: (
    text: string,
    position?:
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center'
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'left-bottom'
  ) => void

  keyboard: {
    register: (payload: Record<string, (e: any) => void>) => void
    unregister: (keys: string[]) => void
  } = {} as any

  setting: {
    register: (payload: Setting | Setting[]) => void
    unregister: (key: string) => void
    updateLabel: (key: string, text: string) => void
    select: (key: string, value: boolean | number, shouldBeCallFn?: Boolean) => void
  } = {} as any

  menu: {
    register: (menu: MenuBar) => void
    unregister: (key: string) => void
    select: (name: string, index: number) => void
  } = {} as any

  toggleController!: () => void

  changHighlightSource!: (highlights: Highlight[]) => void

  changThumbnails!: (src: Thumbnails) => void

  progressHoverCallback: ((rate?: number /** 0 ~ 1 */) => void)[] = []

  config: PartialRequired<UiConfig, 'theme'>

  constructor(config: UiConfig) {
    this.config = mergeDeep({}, defaultConfig, config) as any
    if (this.config.keyboard?.global) {
      this.config.keyboard!.focused = false
    }
  }

  apply(player: Player) {
    const { config } = this
    this.player = player

    const $root = (this.$root = $.create(`div.${root(config)}`))

    renderLayer(this, config)

    if (player.isNativeUI) {
      loadingListener(player)
      renderCoverButton(player, $root)
      renderLoading(player, $root)
      $.render($root, player.$root)
      return
    }

    this.icons = Icons.setupIcons(config.icons)

    startListening(player, config)
    registerKeyboard(this)

    renderError(player, $root, config)
    renderNotice(this)
    renderLoading(player, $root)

    if (config.theme.controller?.coverButton) {
      this.$coverButton = renderCoverButton(player, $root)
    }

    renderController(this)

    renderMask(this)
    renderSetting(this)

    renderMenubar(this)
    renderSubtitle(this)

    registerSpeedSetting(this)
    registerSlide(this)
    registerFullScreenRotation(player, config)

    $.render($root, player.$root)

    return this
  }

  destroy() {}
}

export default function create(config?: UiConfig) {
  return new UI(config!)
}

export * from './types'
