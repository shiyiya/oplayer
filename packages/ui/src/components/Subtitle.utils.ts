export function fixSrt(srt: string) {
  return srt.replace(/(\d\d:\d\d:\d\d)[,.](\d+)/g, (_, $1, $2) => {
    let ms = $2.slice(0, 3)
    if ($2.length === 1) {
      ms = $2 + '00'
    }
    if ($2.length === 2) {
      ms = $2 + '0'
    }
    return `${$1},${ms}`
  })
}

export function srtToVtt(srtText: string) {
  return 'WEBVTT \r\n\r\n'.concat(
    fixSrt(srtText)
      .replace(/\{\\([ibu])\}/g, '</$1>')
      .replace(/\{\\([ibu])1\}/g, '<$1>')
      .replace(/\{([ibu])\}/g, '<$1>')
      .replace(/\{\/([ibu])\}/g, '</$1>')
      .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
      .replace(/{[\s\S]*?}/g, '')
      .concat('\r\n\r\n')
  )
}

export function vttToBlob(vttText: string) {
  return URL.createObjectURL(
    new Blob([vttText], {
      type: 'text/vtt'
    })
  )
}

// https://github.com/jamiees2/ass-to-vtt/blob/master/index.js
export function assToVtt(ass: string) {
  const reAss = new RegExp(
    'Dialogue:\\s\\d+,' +
      '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +
      '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +
      '([^,]*),' +
      '([^,]*),' +
      '(?:[^,]*,){4}' +
      '(.*)$',
    'i'
  )

  return `WEBVTT\r\n\r\n${ass
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(reAss)
      if (!m || !m[1] || !m[2] || !m[5]) return null

      // TODO: support style & tag -> m[3] m[4]

      return {
        start: m[1],
        end: m[2],
        text: escape(
          m[5]
            .replace(/{[\s\S]*?}/g, '')
            .replace(/\\N/g, '\r\n')
            .replace(/\\n/g, ' ')
            .replace(/\\h/g, '&nbsp;')
        )
      }
    })
    .filter((line) => line != null)
    .map((line, i) => `${i + 1}\r\n0${line!.start}0 --> 0${line!.end}0\r\n${line!.text}`)
    .join('\r\n\r\n')}`
}

export function escape(str: string) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  )
}
