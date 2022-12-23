import { PlayerPlugin, $ } from '@oplayer/core'

export default <PlayerPlugin>{
  name: 'oplayer-plugin-chromecast',
  apply(player) {
    let cast: any, session: any, currentMedia: any

    function loadChromecast() {
      return new Promise((resolve, reject) => {
        $.render(
          $.create('script', {
            type: 'text/javascript',
            src: 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
          }),
          document.body
        )

        //@ts-ignore
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
          if (isAvailable) {
            cast = window.chrome.cast
            const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID)
            const apiConfig = new cast.ApiConfig(
              sessionRequest,
              () => {},
              (status: any) => {
                if (status === cast.ReceiverAvailability.AVAILABLE) {
                } else {
                }
              }
            )
            cast.initialize(apiConfig, resolve, reject)
          } else {
            player.plugins.ui?.notice('Chromecast not available')
            player.plugins.ui?.menu.unregister('chromecast')
            reject()
          }
        }
      })
    }

    const discoverDevices = () => {
      cast.requestSession(
        (session: {
          loadMedia: (
            arg0: any,
            arg1: (media: any) => void,
            arg2: (err: any) => void
          ) => { (): any; new (): any; play: { (): void; new (): any } }
        }) => {
          session = session
          const mediaInfo = new cast.media.MediaInfo(player.options.source.src)
          const request = new cast.media.LoadRequest(mediaInfo)

          if (!session) window.open(player.options.source.src)

          session
            .loadMedia(
              request,
              (media: any) => {
                currentMedia = media
              },
              (err: { message: string }) => {
                player.plugins.ui?.notice('Chromecast: ' + err.message)
              }
            )
            .play()
        },
        (err: { code: string; description: any }) => {
          if (err.code === 'cancel') {
            session = undefined
          } else {
            player.plugins.ui?.notice('Chromecast: ' + err.code + (err.description || ''))
          }
        }
      )
    }

    player.plugins.ui?.menu.register({
      name: 'Chromecast',
      icon: `<svg viewBox="0 0 1024 1024" style="scale: 0.9;" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M895.66 128H128a85.44 85.44 0 0 0-85.44 85.44v127.84H128v-127.84h767.66v597.12H597.28V896H896a85.44 85.44 0 0 0 85.44-85.44V213.44A85.44 85.44 0 0 0 896 128zM42.56 767.16v127.84h127.82a127.82 127.82 0 0 0-127.82-127.84z m0-170.56V682a213.26 213.26 0 0 1 213.28 213.32v0.68h85.44a298.38 298.38 0 0 0-298-298.72h-0.66z m0-170.54v85.44c212-0.2 384 171.5 384.16 383.5v1h85.44c-0.92-258.92-210.68-468.54-469.6-469.28z"></path></svg>`,
      onClick() {
        let promis: Promise<any> = Promise.resolve()
        if (!cast) {
          promis = loadChromecast()
        }

        promis.then((_) => {
          if (session) {
            currentMedia?.stop()
            session?.stop()
          } else {
            discoverDevices()
          }
        })
      }
    })
  }
}
