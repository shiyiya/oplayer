import { $ } from '@oplayer/core'

export const wrap = $.css`
  width: 2.5em;
  height: 7.5em;
  padding-bottom: 3px;
  box-sizing: content-box;
`

export const volumeValue = $.css(`
  width: 100%;
  text-align: center;
  height: 28px;
  line-height: 28px;
  margin-bottom: 2px;
  font-size: 80%;
`)

export const track = $.css(`
  position:relative;
  display: flex;
  justify-content: center;
  height: 4.8em;
  cursor: pointer;
`)

export const sliderWrap = $.css(`
  height: 100%;
  width: 2px;
  position: relative;

`)

export const slider = $.css(`
  background: rgb(231 231 231);
  height: 100%;
  width: 2px;
  border-radius: 2px;
`)

export const line = $.css(`
  height: 100%;
  width: 100%;
  background-color: var(--primary-color);
  transform-origin: 0 100%;
  border-radius: 2px;
`)

export const thumb = $.css`
  position:absolute;
  bottom: 0;
  top: auto;
  left: -5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--primary-color);
  vertical-align: middle;
  pointer-events: none;
  `
