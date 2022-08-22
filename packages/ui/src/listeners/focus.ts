import type Player from '@oplayer/core'

const focusListener = (() => {
  let isFocus = false

  return {
    isFocus: () => isFocus,
    startListening: function listener(player: Player, autoFocus: boolean = false) {
      function focus({ target }: FocusEvent) {
        if (target && (player.$root.contains(target as Node) || player.$root == target!)) {
          isFocus = true
        } else {
          isFocus = false
        }
      }

      isFocus = autoFocus
      document.addEventListener('click', focus)
      player.on('destroy', () => {
        document.removeEventListener('click', focus)
      })
    }
  }
})()

export default focusListener
