---
"@oplayer/core": major
"@oplayer/ui": major
"@oplayer/hls": major
"@oplayer/dash": major
"@oplayer/shaka": major
"@oplayer/plugins": major
"@oplayer/mpegts": major
"@oplayer/danmaku": major
"@oplayer/torrent": major
---

## Breaking Changes: Plugin Architecture Refactor

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
