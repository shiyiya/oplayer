import type { MenuDefinition, MenuRegistry as IMenuRegistry } from './types'

/**
 * Central menu registry for managing plugin menus (Chromecast, AirPlay, Playlist, etc).
 * Replaces the old player.context.ui.menu API.
 */
export class MenuRegistryImpl implements IMenuRegistry {
  private _menus: Map<string, MenuDefinition> = new Map()
  private _backend?: {
    register: (m: MenuDefinition) => void
    unregister: (key: string) => void
    select: (name: string, index: number) => void
  }

  /**
   * Connect to a backend (usually the UI plugin's menu system).
   * Must be called before any menus are registered.
   */
  connect(backend: IMenuRegistry): void {
    this._backend = backend
    // Replay all queued menus to the backend
    for (const menu of this._menus.values()) {
      this._backend.register(menu)
    }
  }

  register(menu: MenuDefinition): void {
    this._menus.set(menu.name, menu)
    this._backend?.register(menu)
  }

  unregister(key: string): void {
    const menu = this._menus.get(key)
    if (menu) {
      this._menus.delete(key)
      this._backend?.unregister(key)
    }
  }

  select(name: string, index: number): void {
    this._backend?.select(name, index)
  }

  /** Get all registered menus (for debugging/inspection) */
  getAll(): ReadonlyMap<string, MenuDefinition> {
    return this._menus
  }
}
