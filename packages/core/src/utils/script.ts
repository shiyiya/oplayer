export function loadScript(src: string) {
  const head = document.head
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = src

  return new Promise<Event>((resolve, reject) => {
    script.onload = resolve
    script.onerror = reject
    head.appendChild(script)
  })
}
