# Changelog

## 2.0.0

### Major Changes

- 475fd8e: ## Breaking Changes: Plugin Architecture Refactor

  ### Plugin API
  - `connect()` removed — use `ctx.settings.onRegister()`, `ctx.menus.onRegister()` instead
  - `SettingDefinition.onChange` receives full `SettingDefinition` object as first param (allows destructuring `{ value }` or full object access)
  - `MenuDefinition` has optional `key` field (falls back to `name` if not provided)
  - `MenuRegistry.select(key, index)` — first param changed from `name` to `key`
  - NoOp fallback registries when no UI plugin is registered

  ### New Features
  - `createUI()` factory function for custom UI plugins

  ### Migration
  - Old plugin code using `connect()` → subscribe via `ctx.settings.onRegister()` / `ctx.menus.onRegister()`
  - CDN users referencing `@latest` are not affected, switch to `@2` after stable release

## UnRelease

## [1.2.38-beta.0]

- add Farsi (fa) and Pashto (pa) locales for internationalization of controls (#147)

## [1.2.34-beta.1]

- fix(changeQuality): keep playing

## [1.2.34-beta.0]

- fix index.ui.js

## [1.2.33]

- pause before source changeing.
- single apply plugin.

## [1.2.33-beta.1]

- add events `sourcechangeerror`, `qualitychangeerror`.
- qualitychange fallback.

## [1.2.32]

- Fix the video src is empty when hls video with external subtitle and can't be played. Close #114.

## [1.2.28]

- fix initial playback rate not working

## [1.2.27](https://github.com/shiyiya/oplayer/tree/1.2.27) (2023-05-31)

- fix IOS fullscreen behavior

## [1.2.26](https://github.com/shiyiya/oplayer/tree/1.2.26) (2023-05-27)

- fix broken changevideosource playload
- update IOS fullscreen behavior
