import type { SettingDefinition, SettingRegistry as ISettingRegistry } from './types'

/**
 * Pure event emitter for settings.
 *
 * Plugins call register/unregister/select/updateLabel.
 * UI subscribes to onRegister/onUnregister/onLabelChange/onSelect to render.
 * No connect(), no backend.
 */
export class SettingRegistryImpl implements ISettingRegistry {
  private _settings: Map<string, SettingDefinition> = new Map()
  private _onRegisterCbs: ((def: SettingDefinition) => void)[] = []
  private _onUnregisterCbs: ((key: string) => void)[] = []
  private _onLabelChangeCbs: ((key: string, text: string) => void)[] = []
  private _onSelectCbs: ((key: string, value: boolean | number, callFn?: boolean) => void)[] = []

  /** Subscribe to new settings. Fires immediately for already-registered ones. */
  onRegister(cb: (def: SettingDefinition) => void): void {
    this._onRegisterCbs.push(cb)
    for (const s of this._settings.values()) cb(s)
  }

  /** Subscribe to settings being unregistered. */
  onUnregister(cb: (key: string) => void): void {
    this._onUnregisterCbs.push(cb)
  }

  /** Subscribe to label updates. */
  onLabelChange(cb: (key: string, text: string) => void): void {
    this._onLabelChangeCbs.push(cb)
  }

  /** Subscribe to select events. UI should update highlight and optionally call onChange. */
  onSelect(cb: (key: string, value: boolean | number, callFn?: boolean) => void): void {
    this._onSelectCbs.push(cb)
  }

  register(setting: SettingDefinition | SettingDefinition[]): void {
    const settings = Array.isArray(setting) ? setting : [setting]
    for (const s of settings) {
      const key = s.key || s.name
      this._settings.set(key, s)
      this._onRegisterCbs.forEach(cb => cb(s))
    }
  }

  unregister(key: string): void {
    if (!this._settings.has(key)) return
    this._settings.delete(key)
    this._onUnregisterCbs.forEach(cb => cb(key))
  }

  updateLabel(key: string, text: string): void {
    this._onLabelChangeCbs.forEach(cb => cb(key, text))
  }

  select(key: string, value: boolean | number, callFn?: boolean): void {
    this._onSelectCbs.forEach(cb => cb(key, value, callFn))
  }

  /** Get all registered settings (for debugging/inspection) */
  getAll(): ReadonlyMap<string, SettingDefinition> {
    return this._settings
  }
}
