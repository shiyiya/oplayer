import EventEmitter from '../event'
import type { Player } from '../player'

// ─── Base Types (used by both core and plugin system) ────────────────────────

export type Source = {
  src: string
  poster?: string
  title?: string
  format?:
    | 'auto'
    | 'hls' | 'm3u8'
    | 'dash' | 'mpd'
    | 'flv' | 'm2ts' | 'mpegts'
    | string
  type?: string
}

export type Lang = 'auto' | 'zh' | 'zh-CN' | 'en' | 'fa' | 'pa'

export interface PlayerOptions {
  source?: Source
  autoplay?: boolean
  autopause?: boolean
  muted?: boolean
  loop?: boolean
  volume?: number
  playbackRate?: number
  playsinline?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  lang?: Lang
  languages?: Partial<Record<Lang, any>>
  isLive?: boolean
  videoAttr?: Record<string, boolean | string>
  isNativeUI?: () => boolean
}

export interface Destroyable {
  destroy: () => void | Promise<void>
  [key: string]: any
}

// ─── Plugin Metadata ───────────────────────────────────────────────────────

export interface PluginMeta {
  name: string
  version?: string
  /** Execution priority. Higher = runs earlier in each phase. Default: 0 */
  priority?: number
  /** Plugin names this plugin depends on. Checked at setup time. */
  dependencies?: string[]
}

// ─── Setup Context ─────────────────────────────────────────────────────────

/**
 * Plugins are trusted. `ctx.player` is the full Player instance —
 * no fake readonly wrapper that forces casts everywhere.
 */
export interface PluginSetupContext {
  readonly player: Player
  readonly events: EventEmitter
  readonly settings: SettingRegistry
  readonly menus: MenuRegistry
  readonly notify: (text: string, options?: NotifyOptions) => void
  getPlugin<T = unknown>(name: string): T | undefined
}

// ─── Load Source Context ───────────────────────────────────────────────────

export interface LoadSourceContext {
  readonly video: HTMLVideoElement
  readonly source: Source
  readonly options: Readonly<PlayerOptions>
}

// ─── Setting Registry ──────────────────────────────────────────────────────

export interface SettingDefinition<T = unknown> {
  name: string
  key?: string
  type?: 'selector' | 'switcher' | 'slider' | 'option'
  icon?: string
  children?: SettingDefinition<T>[]
  onChange?: (def: SettingDefinition<T>, ctx?: { index: number; player: Player }) => void | Promise<void>
  default?: T
  value?: T
  min?: number
  max?: number
  step?: number
}

export interface SettingRegistry {
  register(setting: SettingDefinition | SettingDefinition[]): void
  unregister(key: string): void
  updateLabel(key: string, text: string): void
  select(key: string, value: boolean | number, callFn?: boolean): void

  /** Subscribe to new settings. Fires immediately for already-registered ones. */
  onRegister(cb: (def: SettingDefinition) => void): void
  /** Subscribe to settings being unregistered. */
  onUnregister(cb: (key: string) => void): void
  /** Subscribe to label updates. */
  onLabelChange(cb: (key: string, text: string) => void): void
  /** Subscribe to select events. */
  onSelect(cb: (key: string, value: boolean | number, callFn?: boolean) => void): void
}

// ─── Menu Registry ─────────────────────────────────────────────────────────

export interface MenuDefinition {
  /** Unique identifier for unregister/select. Falls back to name if not provided. */
  key?: string
  /** Display name shown to users */
  name: string
  position?: 'top' | 'bottom'
  icon?: string
  children?: { name: string; default?: boolean; value?: unknown }[]
  onChange?: (arg: { value: unknown; name: string }, elm: HTMLButtonElement, player: Player) => void
  onClick?: (elm: HTMLButtonElement, player: Player) => void
}

export interface MenuRegistry {
  register(menu: MenuDefinition): void
  unregister(key: string): void
  select(key: string, index: number): void

  /** Subscribe to new menus. Fires immediately for already-registered ones. */
  onRegister(cb: (def: MenuDefinition) => void): void
  /** Subscribe to menus being unregistered. */
  onUnregister(cb: (key: string) => void): void
  /** Subscribe to select events. */
  onSelect(cb: (key: string, index: number) => void): void
  /** Get all registered menus (for debugging/inspection) */
  getAll(): ReadonlyMap<string, MenuDefinition>
}

// ─── Notify Options ────────────────────────────────────────────────────────

export interface NotifyOptions {
  pos?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-left' | 'top-center' | 'top-right' | 'left-bottom'
}

// ─── Event Types ───────────────────────────────────────────────────────────

export type { PlayerEvent, PlayerListener } from '../event'

// ─── New Plugin Interface ──────────────────────────────────────────────────

export type MaybePromise<T> = T | Promise<T>

// make any to Required
export type PartialRequired<T, K extends keyof T> = {
  [P in K]-?: T[P]
} & Omit<T, K>

// make all Required then Partial any
export type RequiredPartial<T, K extends keyof T> = Required<Omit<T, K>> & {
  [P in K]?: T[P]
}

/**
 * The plugin lifecycle interface.
 * Lifecycle: setup → loadSource → unloadSource → destroy.
 */
export interface PlayerPluginV2<API = unknown> {
  readonly meta: PluginMeta

  /**
   * Called during player.create(). Initialize UI, register events, return API.
   */
  setup(ctx: PluginSetupContext): API | void

  /**
   * Called during player.load(). Match and load a media source.
   * Return false to skip, or a Destroyable to handle cleanup.
   */
  loadSource?(ctx: LoadSourceContext): MaybePromise<Destroyable | false>

  /**
   * Called before switching to a new source. Clean up decoder state only.
   */
  unloadSource?(): void | Promise<void>

  /**
   * Called during player.destroy(). Clean up everything: UI, events, state.
   */
  destroy?(): void | Promise<void>
}
