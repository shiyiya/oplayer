import { EVENTS } from './constants'
export type { PlayerEvent, PlayerListener } from './event'

// Re-export plugin types from the canonical source
export {
  Source,
  PlayerOptions,
  Lang,
  Destroyable,
  PluginMeta,
  PlayerPluginV2,
  PluginSetupContext,
  LoadSourceContext,
  SettingRegistry,
  SettingDefinition,
  MenuRegistry,
  MenuDefinition,
  NotifyOptions,
  MaybePromise,
  PartialRequired,
  RequiredPartial,
} from './plugin'

export type VideoMimeType =
  | 'video/mp4'
  | 'video/webm'
  | 'video/3gp'
  | 'video/ogg'
  | 'video/avi'
  | 'video/mpeg'
  | 'video/object'

export type HLSMimeType =
  | 'application/vnd.apple.mpegurl'
  | 'audio/mpegurl'
  | 'audio/x-mpegurl'
  | 'application/x-mpegurl'
  | 'video/x-mpegurl'
  | 'video/mpegurl'
  | 'application/mpegurl'

export type DASHMimeType = 'application/dash+xml'

export type DefaultPlayerEvent = (typeof EVENTS)[number] | (typeof EVENTS)[number][]

export type PlayerEventName = DefaultPlayerEvent | string | string[]

