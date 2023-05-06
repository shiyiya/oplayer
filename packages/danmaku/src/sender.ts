import { Player, $ } from '@oplayer/core'
import Danmaku from 'danmaku'
import { getMode } from './danmaku-parse'
import { Options, Comment } from './types'

function registerInputStyle() {
  const modeSelectionWrap = $.css(`
  display: none;
  box-sizing: border-box;
  width: 216px;
  height: auto;
  padding: 2px 0 0;
  position: absolute;
  bottom: 100%;
  left: 50%;
  margin-left: -108px;
  background: rgba(21,21,21,.9);
  border-radius: 2px;
  user-select: none;`)

  const modeSelectionRowSelection = $.css(`
  display: flex;
  flex-wrap: wrap;
  margin: 8px -8px 0 0;`)

  const danmakuTypeWrap = $.css({
    width: '30px',
    height: '30px',
    padding: '3px 0',
    'line-height': '30px',
    'text-align': 'center',
    color: 'hsla(0,0%,100%,.8)',
    fill: '#757575',
    position: 'relative',
    'box-sizing': 'border-box',
    cursor: 'pointer',

    '&:hover': {
      fill: 'var(--primary-color)'
    },

    [`&:hover .${modeSelectionWrap}`]: { display: 'block' },

    [`& .${modeSelectionRowSelection} label`]: {
      flex: 1,
      'margin-bottom': '8px'
    },

    '& input[type="radio"]': { display: 'none' },

    '& input[type="radio"]:checked + label > div': {
      background: 'var(--primary-color)'
    }
  })

  const danmakuType = $.css(`
    display: inline-flex;
    height: 100%;
    align-items: center;
  `)

  const danmakuTypeIcon = $.css(`
    display: block;
    width: 36px;
    height: 24px;
  `)

  const danmakuTypeSvg = $.css(`width: 100%;height: 100%;transition: fill .15s ease-in-out;`)

  const modeSelectionRow = $.css(`
  min-height: 22px;
  margin: 10px 20px;
  width: 176px;
  line-height: 22px;
  font-size: 12px;`)

  const modeSelectionRowTitle = $.css(`text-align: left;color: #fff; line-height: 16px;`)

  const modeSelectionSpan = $.css(`
    position: relative;
    cursor: pointer;
    border-radius: 2px;
    color: #fff;
    text-align: center;
    margin-right: 8px;
    background: hsla(0,0%,100%,.2);
    font-size: 12px;
  `)

  const colorPickerInput = $.css(`
    outline: none;
    background-color: transparent;
    color: #fff;
    border: 1px solid hsla(0,0%,100%,.2);
    border-radius: 2px;
    padding: 4px 7px;
    margin: 0 auto 8px auto;
    transition: background .2s;
    color:#000;background:#fff;text-shadow: 0px 0px 6px #FFF;text-align: center;
  `)

  const colorPickerWrap = $.css(
    `display: grid;grid-template-columns: repeat(7,auto);width: 100%;justify-items: center;`
  )

  const activeColor = $.css('box-shadow: 0 0 1px 1px #fff;border-color: #000;')

  const colorPicker = $.css(`
  width: 16px;
  height: 16px;
  border: 1px solid rgba(0,0,0,.3);
  box-sizing: border-box;
  border-radius: 2px;
  margin-bottom: 4px;
  cursor: pointer;
  display: inline-block;
  `)

  const inputBar = $.css(`
  min-width: 25em;
  border-radius: 6px;
  background: #f4f4f4;
  color: #999;
  height:85%;
`)

  const inputBarWrap = $.css(`
  flex: 1;
  display: flex;
  align-items: center;
`)

  const input = $.css(`
  flex-grow: 1;
  padding: 0 8px;
  height: 28px;
  border: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: none;
  line-height: 28px;
  color: #212121;
  font-size: 12px;
  text-decoration: none;
  outline: none;
  touch-action: manipulation;
`)

  const send = $.css(`
  height: 100%;
  width: 62px;
  min-width: 62px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  width: 60px;
  min-width: 60px;
  box-sizing: border-box;
  overflow: hidden;
`)

  const sendBottom = $.css(`
  height: 100%;
  background-color: var(--primary-color,#6668ab);
  color: #fff;
  min-width: 60px;
  outline: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`)

  return {
    inputBar,
    inputBarWrap,
    input,
    send,
    sendBottom,
    danmakuTypeWrap,
    danmakuType,
    danmakuTypeIcon,
    danmakuTypeSvg,
    modeSelectionWrap,
    modeSelectionRow,
    modeSelectionRowTitle,
    modeSelectionRowSelection,
    modeSelectionSpan,
    colorPicker,
    colorPickerInput,
    colorPickerWrap,
    activeColor
  }
}

export function registerInput(player: Player, danmaku: Danmaku, options: Options) {
  if (!player.context.ui) return
  const {
    inputBar,
    inputBarWrap,
    input,
    send,
    sendBottom,
    danmakuTypeWrap,
    danmakuType,
    danmakuTypeIcon,
    danmakuTypeSvg,
    modeSelectionWrap,
    modeSelectionRow,
    modeSelectionRowTitle,
    modeSelectionRowSelection,
    modeSelectionSpan,
    colorPickerWrap,
    colorPicker,
    colorPickerInput,
    activeColor
  } = registerInputStyle()

  const $tpl = $.create(
    `div.${inputBar}`,
    {},
    `<div class="${inputBarWrap}">
      <div class="${danmakuTypeWrap}">
        <span class="${danmakuType}">
          <span class="${danmakuTypeIcon}">
            <svg viewBox="0 0 22 22" class="${danmakuTypeSvg}">
              <path d="M17 16H5c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zM6.96 15c.39 0 .74-.24.89-.6l.65-1.6h5l.66 1.6c.15.36.5.6.89.6.69 0 1.15-.71.88-1.34l-3.88-8.97C11.87 4.27 11.46 4 11 4s-.87.27-1.05.69l-3.88 8.97c-.27.63.2 1.34.89 1.34zM11 5.98L12.87 11H9.13L11 5.98z" />
            </svg>
          </span>
        </span class="${inputBarWrap}">
        <div class="${modeSelectionWrap}">
          <div class="${modeSelectionRow}">
            <div class="${modeSelectionRowTitle}">字号</div>
            <div class="${modeSelectionRowSelection}">
              <input type="radio" id="font-size-s" name="font-size" value="18">
              <label for=font-size-s>
                <div class="${modeSelectionSpan}" data-type="fontsize">
                  <span>小</span>
                </div>
              </label>
              <input type="radio" id="font-size-m" name="font-size" value="25" checked>
              <label for=font-size-m>
                <div class="${modeSelectionSpan}" data-type="fontsize">
                  <span>标准</span>
                </div>
              </label>
            </div>
          </div>
          <div class="${modeSelectionRow}">
            <div class="${modeSelectionRowTitle}">模式</div>
            <div class="${modeSelectionRowSelection}">
              <input type="radio" id="mode-s" name="mode" value="1" checked>
              <label for="mode-s">
                <div class="${modeSelectionSpan}" data-type="mode">
                  <span>滚动</span>
                </div>
              </label>
              <input type="radio" id="mode-t" name="mode" value="5">
              <label for="mode-t">
                <div class="${modeSelectionSpan}" data-type="mode">
                  <span>顶部</span>
                </div>
              </label>
              <input type="radio" id="mode-b" name="mode" value="4">
              <label for="mode-b">
                <div class="${modeSelectionSpan}" data-type="mode">
                  <span>底部</span>
                </div>
              </label>
            </div>
          </div>
          <div class="${modeSelectionRow}">
            <div class="${modeSelectionRowTitle}">颜色</div>
            <div class="${modeSelectionRowSelection}">
              <input class="${colorPickerInput}" value="#FFFFFF" >
                <div class="${colorPickerWrap}">
              ${[
                '#FE0302',
                '#FF7204',
                '#FFAA02',
                '#FFD302',
                '#FFFF00',
                '#A0EE00',
                '#00CD00',
                '#019899',
                '#4266BE',
                '#89D5FF',
                '#CC0273',
                '#222222',
                '#9B9B9B',
                '#FFFFFF'
              ]
                .map((color, i) => {
                  return `<span class="${colorPicker} ${
                    i == 13 ? activeColor : ''
                  }" style="background-color: ${color};" data-value="${color}"></span>`
                })
                .join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <input class="${input}" placeholder="发个友善的弹幕见证当下"/>
    </div>
    <div class="${send}">
      <div class="${sendBottom}">发送</div>
    </div>`
  )
  const $colorPickerInput = $tpl.querySelector<HTMLInputElement>(`.${colorPickerInput}`)!
  const $colorPickerWrap = $tpl.querySelector<HTMLInputElement>(`.${colorPickerWrap}`)!

  $colorPickerInput.oninput = function (e: Event) {
    ;(<HTMLInputElement>e.target).style.backgroundColor = (<HTMLInputElement>e.target).value
  }
  $colorPickerWrap.onclick = function (e: Event) {
    const target = e.target as HTMLSpanElement
    if (target.tagName == 'SPAN') {
      $colorPickerInput.style.backgroundColor = $colorPickerInput.value =
        target.getAttribute('data-value')!

      Array.from(target.parentElement!.children).forEach((it) => it.classList.remove(activeColor))
      target.classList.add(activeColor)
    }
  }

  const parent = player.context.ui.$controllerBottom
  const $input = $tpl.querySelector<HTMLInputElement>(`.${input}`)!
  parent.insertBefore($tpl, parent.children[1]!)

  function submit() {
    const fontSize = $tpl.querySelector<HTMLInputElement>('input[name="font-size"]:checked')!.value
    const mode = $tpl.querySelector<HTMLInputElement>('input[name="mode"]:checked')!.value
    const color = $tpl.querySelector<HTMLInputElement>(`.${colorPickerInput}`)!.value || '#FFFFFF'

    if ($input.value) {
      const comment: Comment = {
        mode: getMode(+mode),
        text: $input.value,
        time: player.currentTime,
        style: { color: color, fontSize: `${fontSize}px` }
      }
      if (options.onEmit?.(comment) || true) {
        const primaryColor = window
          .getComputedStyle(player.context.ui.$root)
          .getPropertyValue('--primary-color')

        //@ts-ignore
        comment.style!.border = `2px solid ${primaryColor}`
        //@ts-ignore
        comment.style!.marginTop = '4px'
        danmaku.emit(comment)
        $input.value = ''
        $input.blur()
      }
    }
  }

  $tpl.querySelector(`.${sendBottom}`)!.addEventListener('click', submit)
  $input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submit()
  })
}
