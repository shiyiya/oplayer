import { PlayerPlugin, $ } from '@oplayer/core'

let castReceiver: typeof chrome.cast

function noop() {}

//TODO: sync event

export default <PlayerPlugin>{
  name: 'oplayer-plugin-chromecast',
  version: __VERSION__,
  apply(player) {
    let currentSession: chrome.cast.Session | undefined, currentMedia: chrome.cast.media.Media | undefined

    function onError(e: chrome.cast.Error | Error) {
      player.context.ui?.notice('Chromecast: ' + (<chrome.cast.Error>e).description || (<Error>e).message)
    }

    function loadChromecast() {
      return new Promise<void>((resolve, reject) => {
        if (castReceiver) {
          resolve()
          return
        }

        $.render(
          $.create('script', {
            type: 'text/javascript',
            src: 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
          }),
          document.body
        )

        window.__onGCastApiAvailable = (isAvailable) => {
          if (isAvailable) {
            castReceiver = window.chrome.cast
            const sessionRequest = new castReceiver.SessionRequest(
              castReceiver.media.DEFAULT_MEDIA_RECEIVER_APP_ID
            )
            const apiConfig = new castReceiver.ApiConfig(sessionRequest, noop, noop)
            castReceiver.initialize(apiConfig, resolve, reject)
          } else {
            reject(new Error('Chromecast not available'))
          }
        }
      })
    }

    const discoverDevices = () => {
      castReceiver.requestSession((session) => {
        currentSession = session
        const { source, isLive } = player.options
        const mediaInfo = new castReceiver.media.MediaInfo(source.src, (<any>source).type || 'video/mp4')
        mediaInfo.metadata.title = source.title
        // mediaInfo.metadata.subtitle
        mediaInfo.streamType = isLive
          ? chrome.cast.media.StreamType.LIVE
          : chrome.cast.media.StreamType.BUFFERED
        if (source.poster) {
          mediaInfo.metadata.images = [{ url: source.poster }]
        }
        const request = new castReceiver.media.LoadRequest(mediaInfo)
        request.currentTime = player.currentTime
        request.autoplay = true

        session.loadMedia(
          request,
          (media) => {
            currentMedia = media
          },
          onError
        )
      }, onError)
    }

    player.context.ui?.menu.register({
      name: 'Chromecast',
      position: 'top',
      icon: player.context.ui?.icons.chromecast,
      onClick() {
        loadChromecast()
          .then((_) => {
            if (currentSession || currentMedia) {
              currentMedia?.stop(new chrome.cast.media.StopRequest(), noop, noop)
              currentSession?.stop(noop, noop)
            }
            setTimeout(discoverDevices)
          })
          .catch(onError)
      }
    })
  }
}
