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

### Patch Changes

- Updated dependencies [475fd8e]
  - @oplayer/core@2.0.0
  - @oplayer/ui@2.0.0

## UnRelease

- playlist: fix error scroll position
- playlist: add `playlistchange` event

## 1.0.12-beta.3

- vtt thumbnails: `prefix` options

## 1.0.12-beta.2

- airplay support

## 1.0.12-beta.0

- chromecast: refactor

## 1.0.11

- playlist: support danmaku

## 1.0.11-alpha.1

- playlist: add error fallback for poster

## 1.0.10-beta.3

- playlist
  - style fixed.

## 1.0.10-beta.2

- playlist
  - style fixed.
  - show current playing index.

## 1.0.10-beta.1

- playlist
  - add keyboard `l`.

## 1.0.10-beta.0

- playlist
  - lazy loading playlist cover.
  - loading animation.
  - add event `playlistsourceerror`.
