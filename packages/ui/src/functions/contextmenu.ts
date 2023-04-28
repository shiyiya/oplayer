import type { Player } from '@oplayer/core'
import { DATA_CONTEXTMENU_ATTR_NAME } from '../style'

export default function registerContextMenu(player: Player) {
  player.on('contextmenu', () => {
    player.$root.setAttribute(
      DATA_CONTEXTMENU_ATTR_NAME,
      `${!Boolean(player.$root.getAttribute(DATA_CONTEXTMENU_ATTR_NAME))}`
    )
  })
}
