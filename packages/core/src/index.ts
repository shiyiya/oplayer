export { $ } from './utils/dom'
export * from './utils/platform'
export * from './utils/index'
export * from './utils/script'

export { Player } from './player'
export { Player as default } from './player'

export type { PlayerEvent, PlayerListener } from './event'

export { SettingRegistryImpl, MenuRegistryImpl, PluginManager } from './plugin'
export type {
  Source,
  PlayerOptions,
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
