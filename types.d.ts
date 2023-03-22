declare const __VERSION__: string

declare module '*.svg?raw' {
  const raw: string
  export default raw
}
