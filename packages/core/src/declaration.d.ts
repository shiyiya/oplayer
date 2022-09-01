declare const __VERSION__: string

declare module '*.json' {
  const json: Record<string, string>
  export default json
}
