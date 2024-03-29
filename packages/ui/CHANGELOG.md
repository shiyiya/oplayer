# Changelog

## UnRelease

## [1.3.0-beta.1]

- fix index.ui banner

## [1.3.0]

- beta and alpha

## [1.2.37-alpha.2]

- fix ios subtitle not hidden

## [1.2.37-alpha.0] Break Changes

- redefine config.
- center progress.
- auto position (menu, setting).

## [1.2.36-beta.4]

- no repeat menu/setting.

## [1.2.36-beta.2]

- fix keyboard config conflicts.

## [1.2.36-beta.0]

- any px -> rem.
- ErrorBuilder custom params.
- add keyboard.
  - k: play | pause
  - m: mute | unmute
- fix global keyboard not working.

## [1.2.35]

- release.

## [1.2.35.beta-2]

- fix keyboard (fn).
- improve custom errorBuilder.

## [1.2.34-beta.1]

- try fix subtitle not working.

## [1.2.34-beta.0]

- add params to menu & setting cb.

## [1.2.33]

- update controller hide behavior.
- fix subtitle not work on custom `videosourcechange`

## [1.2.29-beta.2]

- update screenshot with watermark

## [1.2.29-beta.1]

- fix previous,next event

## [1.2.29-beta.0]

- add watermark (img or svg)
- screenshot with watermark

## [1.2.29]

- hover background for icon
- add previous,next button icon
  ```js
  // 1. set icon
  player.use([ui({ icons: { previous: 'svg', next: 'svg' } })])
  // 2. listen event
  player.on(['previous', 'next'], () => {
    // ...
  })
  ```

## [1.2.28]

- fix grid thumbnails
- update slide seek event

## [1.2.26](https://github.com/shiyiya/oplayer/tree/1.2.26) (2023-05-27)

- fix IOS loading state
- update desktop default size and mobile size on fullscreen

```

```
