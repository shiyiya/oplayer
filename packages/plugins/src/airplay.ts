import Player, { PlayerPlugin } from '@oplayer/core'

const ICON = `<svg style="transform: scale(0.9)" viewBox="0 0 1024 1024"><path d="M662.186667 981.333333H361.813333c-17.194667 0-32.853333-9.386667-40.661333-23.552a50.176 50.176 0 0 1 0-47.104l150.186667-260.565333c7.808-14.08 23.466667-23.509333 40.661333-23.509333 17.194667 0 32.853333 9.386667 40.661333 23.552l150.186667 260.565333c7.850667 14.08 7.850667 32.938667 0 47.061333-7.808 14.122667-23.466667 23.552-40.661333 23.552z m-219.008-94.165333h137.642666L512 767.872l-68.821333 119.296z"></path><path d="M821.76 841.642667h-100.138667c-26.581333 0-46.933333-20.437333-46.933333-47.104 0-26.666667 20.352-47.104 46.933333-47.104h100.138667c37.546667 0 67.285333-29.824 67.285333-67.498667V204.373333c-1.578667-37.674667-31.317333-67.498667-67.285333-67.498666H203.818667c-37.546667 0-67.285333 29.866667-67.285334 67.498666v477.184c0 37.674667 29.738667 67.498667 67.285334 67.498667h100.096c26.624 0 46.933333 20.394667 46.933333 47.104 0 26.666667-20.309333 47.104-46.933333 47.104H203.818667A163.541333 163.541333 0 0 1 42.666667 679.893333V204.373333A161.194667 161.194667 0 0 1 203.818667 42.666667H821.76C909.354667 42.666667 981.333333 114.858667 981.333333 204.373333v477.141334c0 87.893333-71.978667 160.128-159.573333 160.128z"></path></svg>`

class AirPlay implements PlayerPlugin {
  public name = 'oplayer-plugin-airplay'
  public version = __VERSION__

  public player: Player

  constructor() {}

  apply(player: Player) {
    if (!this.canPlay()) return

    this.player = player

    //https://developer.apple.com/documentation/webkitjs/adding_an_airplay_button_to_your_safari_media_controls
    player.$video.addEventListener('webkitplaybacktargetavailabilitychanged', (e: any) => {
      if (e.availability === 'available') {
        this.registerUI()
      } else {
        this.unregisterUI()
      }
    })

    return this
  }

  canPlay() {
    return !!(globalThis as any).WebKitPlaybackTargetAvailabilityEvent
  }

  start() {
    const $media: any = this.player.$video
    if ($media.webkitShowPlaybackTargetPicker) {
      $media.webkitShowPlaybackTargetPicker()
    }
  }

  registerUI() {
    if (!this.player.context.ui) return

    const { menu, icons } = this.player.context.ui

    menu?.register({
      name: 'AirPlay',
      position: 'top',
      icon: icons.airplay || ICON,
      onClick: () => this.start()
    })
  }

  unregisterUI() {
    this.player.context.ui?.menu?.unregister('AirPlay')
  }
}

export default AirPlay
