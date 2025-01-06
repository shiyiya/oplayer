import { Player } from '@oplayer/core'
import { MenuBar } from '@oplayer/ui/src/types'
import { FORMAT_MENU } from './constants'
import { vttThumbnails, ad } from '@oplayer/plugins'
import hls from '@oplayer/hls'

export const register = (player: Player) => {
  player.context.ui?.menu.register(<MenuBar>{
    name: 'FMT',
    position: 'top',
    children: FORMAT_MENU,
    onChange({ value, name }, elm) {
      // src = value
      elm.innerText = name
      player
        .changeSource({ src: value })
        // .changeQuality({ src: value })
        .then((_) => {
          // GET	https://cc.zorores.com/20/2e/202eaab6dff289a5976399077449654e/eng-2.vtt
          // player.context.ui.subtitle.changeSource([
          //   {
          //     name: 'Default',
          //     default: true,
          //     src: 'https://cc.zorores.com/7f/c1/7fc1657015c5ae073e9db2e51ad0f8a0/eng-2.vtt'
          //   }
          // ])
        })
    }
  })

  player.applyPlugin(
    vttThumbnails({
      src: 'https://preview.zorores.com/4b/4b1a02c7ffcad4f1ee11cd6f474548cb/thumbnails/sprite.vtt'
    })
  )

  player.applyPlugin(
    ad({
      autoplay: false,
      image: 'http://5b0988e595225.cdn.sohucs.com/images/20190420/da316f8038b242c4b34f6db18b0418d4.gif',
      // video: VIDEO_LIST[1],
      duration: 10,
      skipDuration: 5,
      target: 'https://oplayer.vercel.app',
      plugins: [hls({ qualityControl: false })]
    })
  )
}
