// @ts-nocheck
;(function () {
  var danmakuScriptCdn = 'https://cdn.jsdelivr.net/npm/@oplayer/danmaku@latest/dist/index.min.js'

  var query = document.location.search.substring(1)
  var src, poster, subtitle, danmaku, watermark
  var playlist = [],
    deps = [],
    m3u = false,
    p = undefined,
    title = '❤OPlayer',
    txt = ''

  var _query = decodeURIComponent(query || '')
  if (_query.startsWith('http')) {
    // ?https://xx.com= 有时候会自动带上 “=”
    src = _query.endsWith('=') ? _query.substring(0, _query.length - 1) : query
  } else if (_query.endsWith('=')) {
    src = atob(_query)
  } else {
    var search = new URLSearchParams(document.location.search)
    src = safeDecodeURIComponent(search.get('src'))
    playlist = JSON.parse(safeDecodeURIComponent(search.get('playlist')) || '[]')
    poster = safeDecodeURIComponent(search.get('poster'))
    title = safeDecodeURIComponent(search.get('title')) || '❤OPlayer'
    danmaku = safeDecodeURIComponent(search.get('danmaku'))
    m3u = safeDecodeURIComponent(search.get('m3u'))
    p = search.has('p') ? search.get('p') : undefined
    p == '' ? (p = undefined) : (p = +p)
    txt = safeDecodeURIComponent(search.get('txt'))

    subtitle = search.get('subtitle')
      ? {
          source: [
            {
              name: 'Default',
              default: true,
              src: decodeURIComponent(search.get('subtitle'))
            }
          ]
        }
      : undefined

    watermark = search.get('watermark')
      ? {
          src: decodeURIComponent(search.get('watermark')),
          style: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            maxWidth: '200px',
            height: 'auto'
          }
        }
      : undefined
  }

  if (title && title != '❤OPlayer') document.title = title

  if (/m3u(#|\?|$)/i.test(src) || m3u) {
    playlist = [{ title: '-', src: typeof m3u == 'string' ? m3u : src, poster }]
    m3u = true
    src = undefined
    deps.push(['https://cdn.jsdelivr.net/npm/m3u8-parser@7.1.0/dist/m3u8-parser.min.js'])
  }

  if (txt) {
    fetch(txt)
      .then((r) => r.text())
      .then((text) => {
        playlist = text.split('\n').map((line) => {
          const [title, src] = line.split(',')
          return { title, src: src }
        })
      })
      .then(applyPlaylist)
      .catch((e) => {
        player.emit('error', e)
      })
  }

  var player = OPlayer.make('#oplayer', {
    source: { src, poster, title: title },
    playbackRate: localStorage.getItem('@oplayer/UserPreferences/speed') || 1,
    volume: localStorage.getItem('@oplayer/UserPreferences/volume') || 1
  })
    .use([
      OUI({
        theme: {
          watermark,
          controller: {
            header: { back: 'fullscreen' },
            slideToSeek: 'always'
          }
        },

        subtitle,
        pictureInPicture: true,
        keyboard: { global: true },
        errorBuilder(e, t, builder) {
          builder({
            ...e,
            message:
              (e.message ? `${e.message}\n\n` : '') +
              (e.code ? `ErrorCode:${e.code} \n\n` : '') +
              'Open an issues https://github.com/shiyiya/oplayer/issues/new/choose'
          })
        },

        icons: {
          play: `<svg style='transform:scale(2)' viewBox='0 0 24 24' > <rect width='24' height='24' fill='none'<path fill='white' fill-rule='evenodd' d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10' clip-rule='evenodd' opacity='0.4'/> <path fill='white' d='m15.414 13.059l-4.72 2.787C9.934 16.294 9 15.71 9 14.786V9.214c0-.924.934-1.507 1.694-1.059l4.72 2.787c.781.462.781 1.656 0 2.118' /></svg>`,
          // play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><path fill="white" d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z" /></svg>`,
          // pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><path fill="none" stroke="white" stroke-width="2" d="M2 6c0-1.886 0-2.828.586-3.414C3.172 2 4.114 2 6 2c1.886 0 2.828 0 3.414.586C10 3.172 10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414C8.828 22 7.886 22 6 22c-1.886 0-2.828 0-3.414-.586C2 20.828 2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414C15.172 2 16.114 2 18 2c1.886 0 2.828 0 3.414.586C22 3.172 22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414C20.828 22 19.886 22 18 22c-1.886 0-2.828 0-3.414-.586C14 20.828 14 19.886 14 18z" /></svg>`,
          volume: [
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" stroke="white" stroke-width="2"><path d="M1.535 10.971c.073-1.208.11-1.813.424-2.394a3.215 3.215 0 0 1 1.38-1.3C3.94 7 4.627 7 6 7c.512 0 .768 0 1.016-.042a3 3 0 0 0 .712-.214c.23-.101.444-.242.871-.524l.22-.144C11.36 4.399 12.632 3.56 13.7 3.925c.205.07.403.17.58.295c.922.648.993 2.157 1.133 5.174A68.21 68.21 0 0 1 15.5 12c0 .532-.035 1.488-.087 2.605c-.14 3.018-.21 4.526-1.133 5.175a2.314 2.314 0 0 1-.58.295c-1.067.364-2.339-.474-4.882-2.151L8.6 17.78c-.427-.282-.64-.423-.871-.525a3 3 0 0 0-.712-.213C6.768 17 6.512 17 6 17c-1.374 0-2.06 0-2.66-.277a3.215 3.215 0 0 1-1.381-1.3c-.314-.582-.35-1.186-.424-2.395A17.127 17.127 0 0 1 1.5 12c0-.323.013-.671.035-1.029Z" /><path stroke-linecap="round" d="M20 6s1.5 1.8 1.5 6s-1.5 6-1.5 6m-2-9s.5.9.5 3s-.5 3-.5 3" /></g></svg>`,
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none"><path fill="white" d="M16.25 12a.75.75 0 0 0-1.5 0zM7.016 6.958l.125.74zM8.6 6.22l-.413-.626zm-.871.524l.303.687zM3.34 16.723l-.315.68zm-1.805-3.695l-.749.046zm.424 2.395l.66-.356zM13.7 20.075l-.242-.71zm1.713-5.47l.749.035zM14.28 19.78l.43.613zM8.818 6.076l.413.626zM13.7 3.925l-.242.71zm.58.295l.43-.614zM3.34 7.277l-.315-.68zm-1.805 3.694l-.749-.045zm.424-2.394l.66.356zm7.952 9.168A.75.75 0 0 0 9.09 19zM9.012 6.846l.22-.144l-.827-1.252l-.219.144zm-6.729 6.137c-.02-.347-.033-.68-.033-.983H.75c0 .341.014.706.036 1.074zM2.25 12c0-.303.012-.636.033-.983l-1.497-.091A17.87 17.87 0 0 0 .75 12zm12.5 0c0 .512-.034 1.45-.086 2.57l1.498.07A68.23 68.23 0 0 0 16.25 12zM6 7.75c.488 0 .817.002 1.141-.053l-.25-1.479c-.171.03-.354.032-.89.032zm2.186-2.156c-.447.295-.602.394-.76.464l.605 1.373c.3-.133.574-.316.981-.585zM7.141 7.697a3.75 3.75 0 0 0 .89-.266l-.606-1.373c-.17.076-.35.13-.534.16zM6.001 17.75c.536 0 .719.002.89.031l.25-1.479c-.324-.055-.653-.052-1.14-.052zm0-1.5c-1.445 0-1.932-.017-2.346-.208l-.63 1.361c.784.363 1.67.347 2.975.347zM.785 13.074c.07 1.153.104 1.947.512 2.704l1.32-.711c-.217-.405-.258-.82-.335-2.084zm2.869 2.968a2.47 2.47 0 0 1-1.036-.975l-1.32.711a3.962 3.962 0 0 0 1.726 1.625zm11.009-1.472c-.072 1.531-.123 2.603-.262 3.378c-.14.771-.337 1.066-.553 1.218l.862 1.227c.706-.496 1.005-1.28 1.167-2.18c.161-.895.215-2.086.284-3.573zm-.722 6.215a3.07 3.07 0 0 0 .769-.392l-.863-1.227a1.568 1.568 0 0 1-.39.199zM9.232 6.702c1.289-.85 2.194-1.445 2.908-1.792c.712-.346 1.069-.36 1.318-.275l.484-1.42c-.818-.28-1.631-.056-2.457.345c-.824.4-1.826 1.063-3.08 1.89zm4.226-2.067c.137.047.272.115.39.198l.863-1.227a3.066 3.066 0 0 0-.769-.39zM6 6.25c-1.304 0-2.19-.016-2.975.346l.63 1.362c.414-.192.901-.208 2.345-.208zm-3.717 4.767c.077-1.264.118-1.68.336-2.084l-1.32-.712C.89 8.979.855 9.772.785 10.926zm.742-4.42A3.962 3.962 0 0 0 1.298 8.22l1.32.712a2.47 2.47 0 0 1 1.037-.975zM9.089 19c1.039.68 1.899 1.224 2.631 1.549c.743.328 1.48.489 2.222.236l-.484-1.42c-.226.077-.54.074-1.13-.188c-.602-.266-1.358-.738-2.417-1.432zm7.034-10.46c-.06-1.227-.127-2.233-.296-3.01c-.172-.789-.477-1.474-1.116-1.924l-.863 1.227c.196.138.377.392.513 1.016c.139.635.202 1.514.264 2.765z" /><path stroke="white" stroke-linecap="round" stroke-width="2" d="M20 18s1.5-1.8 1.5-6c0-2.433-.503-4.061-.927-5M18 15s.5-.9.5-3c0-.862-.084-1.522-.183-2M22 2L2 22" /></g></svg>`
          ],
          fullscreen: [
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="white" d="M18.5 5.5H16a1.5 1.5 0 0 1 0-3h3A2.5 2.5 0 0 1 21.5 5v3a1.5 1.5 0 0 1-3 0zM8 5.5H5.5V8a1.5 1.5 0 1 1-3 0V5A2.5 2.5 0 0 1 5 2.5h3a1.5 1.5 0 1 1 0 3m0 13H5.5V16a1.5 1.5 0 0 0-3 0v3A2.5 2.5 0 0 0 5 21.5h3a1.5 1.5 0 0 0 0-3m8 0h2.5V16a1.5 1.5 0 0 1 3 0v3a2.5 2.5 0 0 1-2.5 2.5h-3a1.5 1.5 0 0 1 0-3" /></g></svg>`,
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="white" d="M17.5 6.5H20a1.5 1.5 0 0 1 0 3h-3A2.5 2.5 0 0 1 14.5 7V4a1.5 1.5 0 0 1 3 0zM4 6.5h2.5V4a1.5 1.5 0 1 1 3 0v3A2.5 2.5 0 0 1 7 9.5H4a1.5 1.5 0 1 1 0-3m0 11h2.5V20a1.5 1.5 0 0 0 3 0v-3A2.5 2.5 0 0 0 7 14.5H4a1.5 1.5 0 0 0 0 3m16 0h-2.5V20a1.5 1.5 0 0 1-3 0v-3a2.5 2.5 0 0 1 2.5-2.5h3a1.5 1.5 0 0 1 0 3" /></g></svg>`
          ],
          pip: [
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" stroke="white" stroke-width="2"><path stroke-linecap="round" d="M11 21h-1c-3.771 0-5.657 0-6.828-1.172C2 18.657 2 16.771 2 13v-2c0-3.771 0-5.657 1.172-6.828C4.343 3 6.229 3 10 3h4c3.771 0 5.657 0 6.828 1.172C22 5.343 22 7.229 22 11" /><path d="M13 17c0-1.886 0-2.828.586-3.414C14.172 13 15.114 13 17 13h1c1.886 0 2.828 0 3.414.586C22 14.172 22 15.114 22 17c0 1.886 0 2.828-.586 3.414C20.828 21 19.886 21 18 21h-1c-1.886 0-2.828 0-3.414-.586C13 19.828 13 18.886 13 17Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M11.5 11.5v-3m0 3h-3m3 0l-4-4" /></g></svg>`,
            `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" stroke="white" stroke-width="2"><path stroke-linecap="round" d="M11 21h-1c-3.771 0-5.657 0-6.828-1.172C2 18.657 2 16.771 2 13v-2c0-3.771 0-5.657 1.172-6.828C4.343 3 6.229 3 10 3h4c3.771 0 5.657 0 6.828 1.172C22 5.343 22 7.229 22 11" /><path d="M13 17c0-1.886 0-2.828.586-3.414C14.172 13 15.114 13 17 13h1c1.886 0 2.828 0 3.414.586C22 14.172 22 15.114 22 17c0 1.886 0 2.828-.586 3.414C20.828 21 19.886 21 18 21h-1c-1.886 0-2.828 0-3.414-.586C13 19.828 13 18.886 13 17Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5v3m0-3h3m-3 0l4 4" /></g></svg>`
          ],
          setting: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3" /><path d="M13.765 2.152C13.398 2 12.932 2 12 2c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083c-.092.223-.129.484-.143.863a1.617 1.617 0 0 1-.79 1.353a1.617 1.617 0 0 1-1.567.008c-.336-.178-.579-.276-.82-.308a2 2 0 0 0-1.478.396C4.04 5.79 3.806 6.193 3.34 7c-.466.807-.7 1.21-.751 1.605a2 2 0 0 0 .396 1.479c.148.192.355.353.676.555c.473.297.777.803.777 1.361c0 .558-.304 1.064-.777 1.36c-.321.203-.529.364-.676.556a2 2 0 0 0-.396 1.479c.052.394.285.798.75 1.605c.467.807.7 1.21 1.015 1.453a2 2 0 0 0 1.479.396c.24-.032.483-.13.819-.308a1.617 1.617 0 0 1 1.567.008c.483.28.77.795.79 1.353c.014.38.05.64.143.863a2 2 0 0 0 1.083 1.083C10.602 22 11.068 22 12 22c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083c.092-.223.129-.483.143-.863c.02-.558.307-1.074.79-1.353a1.617 1.617 0 0 1 1.567-.008c.336.178.579.276.819.308a2 2 0 0 0 1.479-.396c.315-.242.548-.646 1.014-1.453c.466-.807.7-1.21.751-1.605a2 2 0 0 0-.396-1.479c-.148-.192-.355-.353-.676-.555A1.617 1.617 0 0 1 19.562 12c0-.558.304-1.064.777-1.36c.321-.203.529-.364.676-.556a2 2 0 0 0 .396-1.479c-.052-.394-.285-.798-.75-1.605c-.467-.807-.7-1.21-1.015-1.453a2 2 0 0 0-1.479-.396c-.24.032-.483.13-.82.308a1.617 1.617 0 0 1-1.566-.008a1.617 1.617 0 0 1-.79-1.353c-.014-.38-.05-.64-.143-.863a2 2 0 0 0-1.083-1.083Z" /></g></svg>`,
          screenshot: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><g fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="13" r="3" /><path d="M9.778 21h4.444c3.121 0 4.682 0 5.803-.735a4.408 4.408 0 0 0 1.226-1.204c.749-1.1.749-2.633.749-5.697c0-3.065 0-4.597-.749-5.697a4.407 4.407 0 0 0-1.226-1.204c-.72-.473-1.622-.642-3.003-.702c-.659 0-1.226-.49-1.355-1.125A2.064 2.064 0 0 0 13.634 3h-3.268c-.988 0-1.839.685-2.033 1.636c-.129.635-.696 1.125-1.355 1.125c-1.38.06-2.282.23-3.003.702A4.405 4.405 0 0 0 2.75 7.667C2 8.767 2 10.299 2 13.364c0 3.064 0 4.596.749 5.697c.324.476.74.885 1.226 1.204C5.096 21 6.657 21 9.778 21Z" /></svg>`,
          playbackRate: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><path fill="white" d="M19.46 10a1 1 0 0 0-.07 1a7.55 7.55 0 0 1 .52 1.81a8 8 0 0 1-.69 4.73a1 1 0 0 1-.89.53H5.68a1 1 0 0 1-.89-.54A8 8 0 0 1 13 6.06a7.69 7.69 0 0 1 2.11.56a1 1 0 0 0 1-.07a1 1 0 0 0-.17-1.76A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1a10 10 0 0 0 .55-8.89a1 1 0 0 0-1.75-.11" /><path fill="white" d="M10.59 12.59a2 2 0 0 0 2.83 2.83l5.66-8.49z" /></svg>`,
          loop: `<svg viewBox="0 0 256 256"><rect width="256" height="256" fill="none" /><path fill="white" d="M252 128a60 60 0 0 1-102.43 42.43l-.49-.53l-59.86-67.59a36 36 0 1 0 0 51.38l3.08-3.48a12 12 0 1 1 18 15.91l-3.35 3.78l-.49.53a60 60 0 1 1 0-84.86l.49.53l59.86 67.59a36 36 0 1 0 0-51.38l-3.08 3.48a12 12 0 1 1-18-15.91l3.35-3.78l.49-.53A60 60 0 0 1 252 128" /></svg>`,
          loadingIndicator: `<svg class="spinner" width="3em" height="3em" viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><path fill="white" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity="0.5" /><path fill="white" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z" /></svg>`,
          chromecast: `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="2 2 20 20"><path stroke="none" d="M0 0h24v24H0z"></path><path d="M3 19h.01M7 19a4 4 0 0 0-4-4m8 4a8 8 0 0 0-8-8"></path><path d="M15 19h3a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-2.8 2"></path></svg>`
        }
      }),
      OHls({
        forceHLS: true,
        library: 'https://cdn.jsdelivr.net/npm/hls.js@0.14.17/dist/hls.min.js'
      }),
      ODash({ library: 'https://cdn.dashjs.org/v4.7.4/dash.all.min.js' }),
      OMpegts({ library: 'https://cdn.jsdelivr.net/npm/mpegts.js/dist/mpegts.min.js' }),
      OTorrent({ library: 'https://cdn.jsdelivr.net/npm/webtorrent@0.98.18/webtorrent.min.js' }),
      new OPlugin.AirPlay(),
      new OPlugin.Chromecast()
    ])
    .create()
    .on((e) => {
      if (e.type != 'timeupdate' || e.type != 'progress') {
        console.log(e)
      }
    })

  if (danmaku || playlist.some((it) => it.danmaku)) {
    deps.push([
      danmakuScriptCdn,
      () => {
        player.applyPlugin(ODanmaku({ source: danmaku }))
      }
    ])
  }

  loadScripts(deps.map(([s]) => s)).then(() => {
    if (isNaN(p) || typeof p != 'number') {
      player.once('playlistchange', () => {
        setTimeout(() => {
          player.context.playlist.showUI()
        })
      })
    }

    try {
      deps.map(([_, fn]) => fn && fn())
    } catch (error) {}

    applyPlaylist()
  })

  function applyPlaylist() {
    if (playlist.length) {
      player.applyPlugin(
        new OPlugin.Playlist({
          initialIndex: p,
          autoHide: false,
          sources: playlist,
          m3uList: m3u
            ? {
                sourceFormat(info) {
                  try {
                    const chunk = info.title.substring(3).split('" ')
                    const titleWith = /group-title="(.+",.+)/.exec(info.title)
                    const posterWith = /tvg-logo="(.+)"/.exec(info.title)
                    return {
                      src: info.uri,
                      format: 'm3u8',
                      title: titleWith ? titleWith[1] : /group-title="(.+)"/.exec(info.title)[1],
                      poster: posterWith && posterWith[1]
                    }
                  } catch (error) {
                    return { src: info.uri, title: info.title, format: 'm3u8' }
                  }
                }
              }
            : false
        })
      )
    }
  }

  player.on('ratechange', () => {
    if (!player.isSourceChanging)
      localStorage.setItem('@oplayer/UserPreferences/speed', player.playbackRate.toString())
  })

  player.on('volumechange', () => {
    localStorage.setItem('@oplayer/UserPreferences/volume', player.volume.toString())
  })

  function keepTime(e) {
    document.title = e.payload.title
    var prevTime = localStorage.getItem(e.payload.src)
    if (prevTime) {
      player.once('loadedmetadata', () => {
        player.seek(prevTime - 1)
      })
    }
  }
  player.on('videosourcechange', keepTime)
  if (src) {
    keepTime({ payload: { src, title } })
  }

  player.on('timeupdate', () => {
    localStorage.setItem(player.options.source.src, player.currentTime.toString())
  })

  new Promise(() => {
    // https://stackoverflow.com/questions/6370690/media-queries-how-to-target-desktop-tablet-and-mobile
    var $op = document.querySelector('#oplayer')
    // not in iframe
    if (window.self == window.top && $op.clientWidth > 761) {
      $op.firstElementChild.children[1].style.fontSize = $op.clientWidth > 1024 ? '24px' : '22px'
    }
  })

  function loadScripts(scripts) {
    return Promise.all(
      scripts.map((s) => {
        return new Promise((r, f) => {
          var t = document.body.appendChild(document.createElement('script'))
          t.src = s
          t.onload = r
          t.onerror = f
        })
      })
    )
  }

  function safeDecodeURIComponent(uri) {
    return uri ? decodeURIComponent(uri) : undefined
  }
})()
