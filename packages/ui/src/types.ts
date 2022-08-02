export type SnowConfig = {
  theme?: {
    primaryColor: `#${string}`
  }
  /**
   * default: true
   */
  hotkey?: boolean
  /**
   * default: ['2.0', '1.75', '1.25', '1.0', '0.75', '0.5']
   */
  speed?: string[]
  /**
   * default: true
   */
  fullscreen?: boolean
  /**
   * default: false
   */
  fullscreenWeb?: false
  /**
   * default: true
   */
  pictureInPicture?: boolean
  /**
   * default: true
   */
  miniProgressBar?: boolean

  thumbnails?: {}

  subtitle?: {}
}
