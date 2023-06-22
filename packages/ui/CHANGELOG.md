# Changelog

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

```

## [1.2.28]

- fix grid thumbnails
- update slide seek event

## [1.2.26](https://github.com/shiyiya/oplayer/tree/1.2.26) (2023-05-27)

- fix IOS loading state
- update desktop default size and mobile size on fullscreen
```
