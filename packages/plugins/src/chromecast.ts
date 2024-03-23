import { PlayerPlugin, loadSDK, isIOS } from '@oplayer/core'

function noop() {}

const IS_CHROME = !!window.chrome

//TODO: sync event

export default <PlayerPlugin>{
  name: 'oplayer-plugin-chromecast',
  version: __VERSION__,
  apply(player) {
    if (!IS_CHROME || isIOS) return

    let currentSession: chrome.cast.Session | undefined, currentMedia: chrome.cast.media.Media | undefined
    const ui = player.context.ui

    function onError(e: chrome.cast.Error | Error) {
      const message = (<chrome.cast.Error>e).description || (<Error>e).message
      if (message) ui.notice('Chromecast: ' + message)
      console.warn('chromecast: ', e)
    }

    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID)
        const apiConfig = new chrome.cast.ApiConfig(sessionRequest, noop, noop)
        chrome.cast.initialize(apiConfig, noop, onError)
      } else {
        onError(new Error('Chromecast not available'))
      }
    }

    const discoverDevices = () => {
      chrome.cast.requestSession((session) => {
        currentSession = session
        const {
          source: { title, src, poster, type },
          isLive
        } = player.options
        const mediaInfo = new chrome.cast.media.MediaInfo(src, type || 'video/mp4')
        if (!mediaInfo.metadata) mediaInfo.metadata = {} // ??
        if (title) mediaInfo.metadata.title = title
        if (poster) mediaInfo.metadata.images = [{ url: poster }]
        // mediaInfo.metadata.subtitle
        mediaInfo.streamType = isLive
          ? chrome.cast.media.StreamType.LIVE
          : chrome.cast.media.StreamType.BUFFERED

        const request = new chrome.cast.media.LoadRequest(mediaInfo)
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

    ui.menu.register({
      name: 'Chromecast',
      position: 'top',
      icon:
        ui.icons.chromecast ||
        `<svg viewBox="0 0 1024 1024" style="scale: 0.9;"><path d="M895.66 128H128a85.44 85.44 0 0 0-85.44 85.44v127.84H128v-127.84h767.66v597.12H597.28V896H896a85.44 85.44 0 0 0 85.44-85.44V213.44A85.44 85.44 0 0 0 896 128zM42.56 767.16v127.84h127.82a127.82 127.82 0 0 0-127.82-127.84z m0-170.56V682a213.26 213.26 0 0 1 213.28 213.32v0.68h85.44a298.38 298.38 0 0 0-298-298.72h-0.66z m0-170.54v85.44c212-0.2 384 171.5 384.16 383.5v1h85.44c-0.92-258.92-210.68-468.54-469.6-469.28z"></path></svg>`,
      onClick() {
        loadSDK(
          'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1',
          'chrome',
          '__onGCastApiAvailable',
          (chrome: typeof window.chrome) => typeof chrome.cast != 'undefined'
        )
          .then(() => {
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
