import type { Player, PlayerPlugin, Source } from '@oplayer/core'
import { loadSDK, isIOS } from '@oplayer/core'

const IS_CHROME = !!globalThis.chrome

const ICON = `<svg viewBox="0 0 1024 1024" style="scale: 0.9;"><path d="M895.66 128H128a85.44 85.44 0 0 0-85.44 85.44v127.84H128v-127.84h767.66v597.12H597.28V896H896a85.44 85.44 0 0 0 85.44-85.44V213.44A85.44 85.44 0 0 0 896 128zM42.56 767.16v127.84h127.82a127.82 127.82 0 0 0-127.82-127.84z m0-170.56V682a213.26 213.26 0 0 1 213.28 213.32v0.68h85.44a298.38 298.38 0 0 0-298-298.72h-0.66z m0-170.54v85.44c212-0.2 384 171.5 384.16 383.5v1h85.44c-0.92-258.92-210.68-468.54-469.6-469.28z"></path></svg>`

// TODO: Sync remote controller state

export interface ChromeCastOptions {
  autoJoinPolicy?: chrome.cast.AutoJoinPolicy
  language?: string | undefined
  receiverApplicationId?: string | undefined
  resumeSavedSession?: boolean | undefined
  /** The following flag enables Cast Connect(requires Chrome 87 or higher) */
  androidReceiverCompatible?: boolean | undefined
}

class ChromeCast implements PlayerPlugin {
  public name = 'oplayer-plugin-chromecast'
  public version = __VERSION__

  public player: Player
  public _player?: cast.framework.RemotePlayer

  constructor(public options?: ChromeCastOptions) {}

  apply(player: Player) {
    if (!this.canPlay()) return

    this.player = player
    this.registerUI()

    return this
  }

  get cast() {
    return cast.framework.CastContext.getInstance()
  }

  get castSessionMedia() {
    return this.cast.getCurrentSession()?.getSessionObj().media[0]
  }

  get isCastConnected() {
    return this.cast.getCastState() === cast.framework.CastState.CONNECTED
  }

  get device() {
    return this.cast.getCurrentSession()?.getCastDevice()
  }

  hasActiveCastSession(source: Source | undefined | null) {
    const contentId = this.castSessionMedia?.media?.contentId
    return contentId === source?.src
  }

  canPlay() {
    return IS_CHROME && !isIOS
  }

  async __requestChromeCast() {
    if (!this._player) {
      this._player = new cast.framework.RemotePlayer()
      new cast.framework.RemotePlayerController(this._player)
    }

    if (this.hasActiveCastSession(this.player.options.source)) {
      return
    }

    this.cast.setOptions({
      receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
      ...this.options
    })

    //@ts-ignore
    const errorCode = (await chrome.cast.requestSession()) as chrome.cast.ErrorCode
    if (errorCode) {
      throw new Error(`Chrome Cast Error Code: ${errorCode}`)
    }
    return this.cast.getCurrentSession()?.loadMedia(this.__buildRequest())
  }

  __buildRequest() {
    const { source, isLive } = this.player.options
    const mediaInfo = new chrome.cast.media.MediaInfo(source.src, source.type || 'video/mp4')
    mediaInfo.streamType = isLive ? chrome.cast.media.StreamType.LIVE : chrome.cast.media.StreamType.BUFFERED

    const metadata = new chrome.cast.media.GenericMediaMetadata()
    if (source.title) metadata.title = source.title
    if (source.poster) metadata.images = [{ url: source.poster, height: null, width: null }]
    mediaInfo.metadata = metadata

    const subtitles = this.player.context.ui?.config.subtitle?.source as any[]
    mediaInfo.tracks = subtitles.map((sub, id) => {
      const track = new chrome.cast.media.Track(id, chrome.cast.media.TrackType.TEXT)

      track.name = sub.name
      track.trackContentId = sub.src
      track.trackContentType = sub.type || 'text/vtt' //TODO: url match
      track.language = sub.language || sub.name
      track.subtype = chrome.cast.media.TextTrackType.CAPTIONS

      return track
    })

    const request = new chrome.cast.media.LoadRequest(mediaInfo)

    request.autoplay = this.player.isPlaying
    request.currentTime = this.player.currentTime

    return request
  }

  _loadCast() {
    if (!!window.cast?.framework) return

    return new Promise<void>((resolve, reject) => {
      window.__onGCastApiAvailable = (isAvailable) => {
        window.__onGCastApiAvailable == undefined

        if (isAvailable) {
          resolve()
        } else {
          reject(Error('CAST_NOT_AVAILABLE'))
        }
      }

      loadSDK(
        'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1',
        'cast',
        '__onGCastApiAvailable'
      )
    })
  }

  async start() {
    try {
      await this._loadCast()

      // const State = window.cast.framework.CastState
      // if (this.cast.getCastState() === State.NO_DEVICES_AVAILABLE) {
      // throw new Error(`Chrome Cast Error Code: ${State.NO_DEVICES_AVAILABLE}`)
      // }

      const errorCode = await this.__requestChromeCast()
      if (errorCode) {
        throw new Error(`Chrome Cast Error Code: ${errorCode}`)
      }
    } catch (error) {
      let msg = 'UNKNOWN ERROR'

      if (error instanceof Error) {
        msg = error.message
      } else if (!!chrome.cast && error instanceof chrome.cast.Error) {
        msg = `${error.code} - ${error.description} \n ${error.details}`
      }

      this.player.emit('notice', { text: msg })
    }
  }

  registerUI() {
    if (!this.player.context.ui) return

    const { menu, icons } = this.player.context.ui

    menu?.register({
      name: 'ChromeCast',
      position: 'top',
      icon: icons.chromecast || ICON,
      onClick: () => this.start()
    })
  }
}

export default ChromeCast
