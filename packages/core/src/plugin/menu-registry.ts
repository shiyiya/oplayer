import type { MenuDefinition, MenuRegistry as IMenuRegistry } from './types'

/**
 * Pure event emitter for menus.
 *
 * Plugins call register/unregister/select.
 * UI subscribes to onRegister/onUnregister/onSelect to render.
 * No connect(), no backend.
 */
export class MenuRegistryImpl implements IMenuRegistry {
  private _menus: Map<string, MenuDefinition> = new Map()
  private _onRegisterCbs: ((def: MenuDefinition) => void)[] = []
  private _onUnregisterCbs: ((key: string) => void)[] = []
  private _onSelectCbs: ((key: string, index: number) => void)[] = []

  /** Subscribe to new menus. Fires immediately for already-registered ones. */
  onRegister(cb: (def: MenuDefinition) => void): void {
    this._onRegisterCbs.push(cb)
    for (const m of this._menus.values()) cb(m)
  }

  /** Subscribe to menus being unregistered. */
  onUnregister(cb: (key: string) => void): void {
    this._onUnregisterCbs.push(cb)
  }

  /** Subscribe to select events. UI should update highlight and call onClick/onChange. */
  onSelect(cb: (key: string, index: number) => void): void {
    this._onSelectCbs.push(cb)
  }

  register(menu: MenuDefinition): void {
    const key = menu.key || menu.name
    this._menus.set(key, menu)
    this._onRegisterCbs.forEach(cb => cb(menu))
  }

  unregister(key: string): void {
    if (!this._menus.has(key)) return
    this._menus.delete(key)
    this._onUnregisterCbs.forEach(cb => cb(key))
  }

  select(key: string, index: number): void {
    this._onSelectCbs.forEach(cb => cb(key, index))
  }

  /** Get all registered menus (for debugging/inspection) */
  getAll(): ReadonlyMap<string, MenuDefinition> {
    return this._menus
  }
}
