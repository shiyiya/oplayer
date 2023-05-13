// ==UserScript==
// @name         oplayer
// @version      0.0.1
// @description  -
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @author       -
// @namespace    http://tampermonkey.net/
// @homepage     -
// @match        *://*/*
// @exclude      https://ohplayer.netlify.app/*
// @exclude      *://*bilibili.com/*
// @connect      *
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM.openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @run-at       document-start
// @ https://greasyfork.org/zh-CN/scripts/449581-m3u8%E8%A7%86%E9%A2%91%E4%BE%A6%E6%B5%8B%E4%B8%8B%E8%BD%BD%E5%99%A8-%E8%87%AA%E5%8A%A8%E5%97%85%E6%8E%A2
// ==/UserScript==

;(function (window) {
  const mgmapi = {
    openInTab(url, open_in_background = false) {
      return (typeof GM_openInTab === 'function' ? GM_openInTab : GM.openInTab)(
        url,
        open_in_background
      )
    },
    xmlHttpRequest(details) {
      return (typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest : GM.xmlHttpRequest)(
        details
      )
    },
    copyText(text) {
      copyTextToClipboard(text)
      function copyTextToClipboard(text) {
        var copyFrom = document.createElement('textarea')
        copyFrom.textContent = text
        document.body.appendChild(copyFrom)
        copyFrom.select()
        document.execCommand('copy')
        copyFrom.blur()
        document.body.removeChild(copyFrom)
      }
    }
  }

  // 请求检测
  // const _fetch = unsafeWindow.fetch;
  // unsafeWindow.fetch = function (...args) {
  //     if (checkUrl(args[0])) doM3U({ url: args[0] });
  //     return _fetch(...args);
  // }

  const _r_text = unsafeWindow.Response.prototype.text
  unsafeWindow.Response.prototype.text = function () {
    return new Promise((resolve, reject) => {
      _r_text
        .call(this)
        .then((text) => {
          resolve(text)
          if (checkContent(text)) {
            openPlayerPage(this.url)
          }
        })
        .catch(reject)
    })
  }

  const _r_open = unsafeWindow.XMLHttpRequest.prototype.open
  unsafeWindow.XMLHttpRequest.prototype.open = function (...args) {
    if (checkUrl(args[1])) {
      openPlayerPage(args[1])
    } else {
      this.addEventListener('load', () => {
        if (checkContent(this.responseText)) {
          openPlayerPage(args[1])
        }
      })
    }
    return _r_open.apply(this, args)
  }

  window.addEventListener('copy', function () {
    var text = window.getSelection()?.toString()
    if (checkUrl(text)) {
      openPlayerPage(text)
    }
  })

  window.addEventListener('load', () => {
    setTimeout(() => {
      detectVideoTags()
    }, 3000)
  })

  var pushState = history.pushState
  history.pushState = function () {
    setTimeout(() => {
      detectVideoTags()
    }, 3000)
    return pushState.apply(history, arguments)
  }

  var observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      var target = mutation.target
      switch (mutation.type) {
      }
    })
  })

  function detectVideoTags() {
    for (let v of Array.from(document.querySelectorAll('video'))) {
      const sources = v.querySelectorAll('source')
      if (sources.length) {
        openPlayerPage(sources.item(0).src)
      } else {
        if (v.src.startsWith('http')) {
          observer.observe(v, {
            attributes: true,
            attributeFilter: ['src']
          })
          openPlayerPage(v.src)
        }
      }
    }
  }

  function checkUrl(url) {
    url = new URL(url, location.href)
    if (['.m3u8', '.m3u', '.m4s', '.mp4'].some((ext) => url.pathname.endsWith(ext))) {
      return true
    }
  }

  function checkContent(content) {
    if (content.trim().startsWith('#EXTM3U')) {
      return true
    }
  }

  var latestOpenTS = 0
  function openPlayerPage(url) {
    if (Date.now() - latestOpenTS < 2000) return
    latestOpenTS = Date.now()
    if (window.confirm(`detected video: ${url}`)) {
      latestOpenTS = Date.now()
      mgmapi.openInTab(`https://ohplayer.netlify.app/ohls?${url}`)
    }
  }
})(window)
