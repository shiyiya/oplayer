import type { SettingDefinition, SettingRegistry as ISettingRegistry } from './types'

/**
 * Central setting registry for managing plugin settings (quality, audio, subtitle, etc).
 * Replaces the old player.context.ui.setting API.
 */
export class SettingRegistryImpl implements ISettingRegistry {
  private _settings: Map<string, SettingDefinition> = new Map()
  private _backend?: {
    register: (s: SettingDefinition | SettingDefinition[]) => void
    unregister: (key: string) => void
    updateLabel: (key: string, text: string) => void
    select: (key: string, value: boolean | number, callFn?: boolean) => void
  }

  /**
   * Connect to a backend (usually the UI plugin's setting system).
   * Must be called before any settings are registered.
   */
  connect(backend: ISettingRegistry): void {
    this._backend = backend
    // Replay all queued settings to the backend
    for (const [key, setting] of this._settings) {
      this._backend.register({ ...setting, key: setting.key || key })
    }
  }

  register(setting: SettingDefinition | SettingDefinition[]): void {
    const settings = Array.isArray(setting) ? setting : [setting]

    for (const s of settings) {
      const key = s.key || s.name
      this._settings.set(key, s)

      // If backend is connected, forward immediately
      this._backend?.register(s)
    }
  }

  unregister(key: string): void {
    this._settings.delete(key)
    this._backend?.unregister(key)
  }

  updateLabel(key: string, text: string): void {
    this._backend?.updateLabel(key, text)
  }

  select(key: string, value: boolean | number, callFn?: boolean): void {
    this._backend?.select(key, value, callFn)
  }

  /** Get all registered settings (for debugging/inspection) */
  getAll(): ReadonlyMap<string, SettingDefinition> {
    return this._settings
  }
}
