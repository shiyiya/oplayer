export const loadScript = (src: string, onLoad: () => void, onError: (e: unknown) => void): void => {
  const script = document.createElement('script')
  script.src = src
  script.onload = onLoad
  script.onerror = onError
  const firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag?.parentNode?.insertBefore(script, firstScriptTag)
}

const pendingSDKRequests: Record<string, PendingSDKRequest[]> = {}
type PendingSDKRequest<SDKType = any> = {
  resolve: (value: SDKType) => void
  reject: (reason: unknown) => void
}

export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined'

export const loadSDK = <SDKType = unknown>(
  url: string,
  sdkGlobalVar: string,
  sdkReadyVar?: string,
  isLoaded: (sdk: SDKType) => boolean = () => true,
  loadScriptFn = loadScript
): Promise<SDKType> => {
  const getGlobal = (key: keyof Window) => {
    if (!isUndefined(window[key])) return window[key]
    if (window.exports && window.exports[key]) return window.exports[key]
    if (window.module && window.module.exports && window.module.exports[key]) {
      return window.module.exports[key]
    }
    return undefined
  }

  const existingGlobal = getGlobal(sdkGlobalVar as keyof Window)

  if (existingGlobal && isLoaded(existingGlobal)) {
    return Promise.resolve(existingGlobal)
  }

  return new Promise<SDKType>((resolve, reject) => {
    if (!isUndefined(pendingSDKRequests[url])) {
      pendingSDKRequests[url]!.push({ resolve, reject })
      return
    }

    pendingSDKRequests[url] = [{ resolve, reject }]

    const onLoaded = (sdk: SDKType) => {
      pendingSDKRequests[url]?.forEach((request) => request.resolve(sdk))
    }

    if (!isUndefined(sdkReadyVar)) {
      const previousOnReady: (...arg: any) => void = window[sdkReadyVar as keyof Window]
      ;(window as any)[sdkReadyVar as any] = function (...args: any) {
        if (!isUndefined(previousOnReady)) previousOnReady(...args)
        onLoaded(getGlobal(sdkGlobalVar as keyof Window))
      }
    }

    loadScriptFn(
      url,
      () => {
        if (isUndefined(sdkReadyVar)) onLoaded(getGlobal(sdkGlobalVar as keyof Window))
      },
      (e) => {
        pendingSDKRequests[url]?.forEach((request) => {
          request.reject(e)
        })
        delete pendingSDKRequests[url]
      }
    )
  })
}
