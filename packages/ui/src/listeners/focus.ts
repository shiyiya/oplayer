import type Player from '@oplayer/core'

const focusListener = (() => {
  let isFocus = false

  return {
    isFocus: () => isFocus,
    startListening: function listener(player: Player) {
      function focus({ target }: FocusEvent) {
        if (target && (player.$root.contains(target as Node) || player.$root == target!)) {
          isFocus = true
        } else {
          isFocus = false
        }
      }

      document.addEventListener('click', focus)
      player.on('destroy', () => {
        document.removeEventListener('click', focus)
      })
    }
  }
})()

export default focusListener
