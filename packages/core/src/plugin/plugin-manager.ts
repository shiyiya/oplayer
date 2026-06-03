import type { Source, Destroyable } from '../types'
import type { Player } from '../player'
import { SettingRegistryImpl } from './setting-registry'
import { MenuRegistryImpl } from './menu-registry'
import type {
  PlayerPluginV2,
  PluginSetupContext,
  LoadSourceContext,
  SettingRegistry,
  MenuRegistry,
  NotifyOptions
} from './types'

/**
 * Internal storage for registered plugins
 */
interface RegisteredPlugin {
  plugin: PlayerPluginV2<unknown>
  /** API returned from setup() */
  api?: unknown
  /** Whether setup has been called */
  isSetup: boolean
}

/**
 * Manages the full plugin lifecycle:
 *   register → setup → [loadSource → unloadSource]×N → destroy
 */
export class PluginManager {
  private _registered: Map<string, RegisteredPlugin> = new Map()
  private _setupContexts: Map<string, PluginSetupContext> = new Map()
  private _settingRegistry: SettingRegistryImpl
  private _menuRegistry: MenuRegistryImpl
  private _player: Player
  private _currentLoader?: string
  private _isUIConnected = false

  constructor(player: Player) {
    this._player = player
    this._settingRegistry = new SettingRegistryImpl()
    this._menuRegistry = new MenuRegistryImpl()
  }

  // ─── Registration ────────────────────────────────────────────────────

  /**
   * Register a plugin. This stores it but does NOT call setup() yet.
   * setup() is called during create().
   */
  register(plugin: PlayerPluginV2<unknown>): void {
    this._register(plugin)
  }

  private _register(plugin: PlayerPluginV2<unknown>): void {
    const name = plugin.meta.name
    if (this._registered.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`)
    }
    this._registered.set(name, {
      plugin,
      api: undefined,
      isSetup: false
    })
  }

  // ─── Setup Phase (called during player.create()) ─────────────────────

  /**
   * Call setup() on all registered plugins.
   * Checks dependencies, resolves order, and initializes each plugin.
   */
  setup(): void {
    const order = this._resolveOrder()

    for (const name of order) {
      const entry = this._registered.get(name)
      if (!entry || entry.isSetup) continue

      this._checkDependencies(entry)

      const ctx = this._createSetupContext(name)
      try {
        entry.api = entry.plugin.setup(ctx)
        entry.isSetup = true
      } catch (err) {
        console.error(`[OPlayer] Plugin "${name}" setup failed:`, err)
      }
    }

    // Connect registries to UI backend if available
    this._connectToUI()
  }

  private _resolveOrder(): string[] {
    const result: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        console.warn(`[OPlayer] Circular dependency detected involving "${name}"`)
        return
      }

      visiting.add(name)
      const entry = this._registered.get(name)
      if (entry?.plugin.meta.dependencies) {
        for (const dep of entry.plugin.meta.dependencies) {
          if (this._registered.has(dep)) {
            visit(dep)
          } else {
            console.warn(`[OPlayer] Plugin "${name}" depends on "${dep}" which is not registered`)
          }
        }
      }
      visiting.delete(name)
      visited.add(name)
      result.push(name)
    }

    const names = Array.from(this._registered.keys()).sort((a, b) => {
      const aEntry = this._registered.get(a)!
      const bEntry = this._registered.get(b)!
      return (bEntry.plugin.meta.priority ?? 0) - (aEntry.plugin.meta.priority ?? 0)
    })

    for (const name of names) {
      visit(name)
    }

    return result
  }

  private _checkDependencies(entry: RegisteredPlugin): void {
    const deps = entry.plugin.meta.dependencies
    if (!deps) return

    for (const dep of deps) {
      const depEntry = this._registered.get(dep)
      if (!depEntry) {
        throw new Error(`Plugin "${entry.plugin.meta.name}" requires "${dep}" but it is not registered`)
      }
      if (!depEntry.isSetup) {
        const ctx = this._createSetupContext(dep)
        depEntry.api = depEntry.plugin.setup(ctx)
        depEntry.isSetup = true
      }
    }
  }

  private _createSetupContext(pluginName: string): PluginSetupContext {
    const p = this._player
    const ctx: PluginSetupContext = {
      player: p,
      events: p.eventEmitter,
      settings: this._settingRegistry,
      menus: this._menuRegistry,
      notify: (text: string, options?: NotifyOptions) => {
        p.emit('notice', { text, ...options, pluginName })
      },
      getPlugin: <T = unknown>(name: string): T | undefined => {
        const entry = this._registered.get(name)
        return (entry?.api as T) ?? undefined
      }
    }

    this._setupContexts.set(pluginName, ctx)
    return ctx
  }

  private _connectToUI(): void {
    if (this._isUIConnected) return
    const uiEntry = this._registered.get('ui')
    if (!uiEntry?.api) return

    const ui = uiEntry.api as any
    if (ui?.setting) {
      this._settingRegistry.connect({
        register: (s) => ui.setting.register(s),
        unregister: (k) => ui.setting.unregister(k),
        updateLabel: (k, t) => ui.setting.updateLabel(k, t),
        select: (k, v, c) => ui.setting.select(k, v, c)
      })
    }
    if (ui?.menu) {
      this._menuRegistry.connect({
        register: (m) => ui.menu.register(m),
        unregister: (k) => ui.menu.unregister(k),
        select: (n, i) => ui.menu.select(n, i)
      })
    }
    this._isUIConnected = true
  }

  // ─── Load Source Phase ───────────────────────────────────────────────

  /**
   * Find a plugin that can handle the given source and call its loadSource().
   * Plugins are checked in priority order (highest first).
   */
  async loadSource(source: Source): Promise<Destroyable | undefined> {
    if (this._currentLoader) {
      const entry = this._registered.get(this._currentLoader)
      if (entry?.plugin.unloadSource) {
        await entry.plugin.unloadSource()
      }
      this._currentLoader = undefined
    }

    const plugins = Array.from(this._registered.values())
      .filter((e) => e.isSetup && e.plugin.loadSource)
      .sort((a, b) => (b.plugin.meta.priority ?? 0) - (a.plugin.meta.priority ?? 0))

    const ctx: LoadSourceContext = {
      video: this._player.$video,
      source,
      options: this._player.options
    }

    for (const entry of plugins) {
      try {
        const result = await entry.plugin.loadSource!(ctx)
        if (result !== false) {
          this._currentLoader = entry.plugin.meta.name
          return result as Destroyable
        }
      } catch (err) {
        console.error(`[OPlayer] Plugin "${entry.plugin.meta.name}" loadSource failed:`, err)
      }
    }

    return undefined
  }

  // ─── Destroy Phase ───────────────────────────────────────────────────

  async destroy(): Promise<void> {
    if (this._currentLoader) {
      const entry = this._registered.get(this._currentLoader)
      if (entry?.plugin.unloadSource) {
        try {
          await entry.plugin.unloadSource()
        } catch {
          /* ignore */
        }
      }
    }

    const names = Array.from(this._registered.keys()).reverse()
    for (const name of names) {
      const entry = this._registered.get(name)
      if (entry?.plugin.destroy) {
        try {
          await entry.plugin.destroy()
        } catch (err) {
          console.error(`[OPlayer] Plugin "${name}" destroy failed:`, err)
        }
      }
    }

    this._registered.clear()
    this._setupContexts.clear()
  }

  // ─── Accessors ───────────────────────────────────────────────────────

  get settings(): SettingRegistry {
    return this._settingRegistry
  }

  get menus(): MenuRegistry {
    return this._menuRegistry
  }

  getPlugin<T = unknown>(name: string): T | undefined {
    return this._registered.get(name)?.api as T
  }

  has(name: string): boolean {
    return this._registered.has(name)
  }
}
