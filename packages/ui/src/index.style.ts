import type { Emotion } from '@oplayer/core'
import { SnowConfig } from '.'

export const ohui = (css: Emotion['css'], theme: SnowConfig['theme']) =>
  css`
    --primary-color: ${theme?.primaryColor};
    /* https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba */
    --shadow-color: ${theme?.primaryColor}7F;

    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;

    &,
    & > * {
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    & button.oh-icon {
      display: inline-block;
      margin: 0px;
      padding: 0.5em;
      border: none;
      border-radius: 0px;
      font-size: inherit;
      color: rgba(255, 255, 255, 0.7);
      background: none;
      cursor: pointer;
      transition: color 300ms ease 0s;
    }

    @media only screen and (max-width: 991px) {
      & button.oh-icon {
        padding: 4px 8px;
      }
    }
  `

export const ohmask = (css: Emotion['css']) =>
  css`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  `

export const oharea = (css: Emotion['css']) =>
  css`
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
  `

export const ohplay = (css: Emotion['css']) =>
  css`
    fill: currentcolor;
    position: absolute;
    right: 40px;
    bottom: 45px;

    & > .oh-icon {
      width: 3em;

      & > svg {
        fill: currentcolor;
        filter: drop-shadow(0px 0px 5px var(--shadow-color));
      }
    }

    @media only screen and (max-width: 991px) {
      & {
        position: absolute;
        right: unset;
        bottom: unset;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      & > .oh-icon {
        width: 2.5em;
      }
    }
  `

export const ohloading = (css: Emotion['css']) =>
  css`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `

export const ohcontrollerwrap = (css: Emotion['css']) =>
  css`
    transition: width 0.3s ease;
    box-sizing: border-box;
    padding: 5px 0;
    cursor: pointer;
    width: 100%;

    &:hover .oh-controller-progress-played-dot::before {
      transform: scale(1);
    }

    &:hover .oh-controller-progress-hit {
      opacity: 1;
    }
  `

export const ohcontroller = (css: Emotion['css']) =>
  css`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    /* height: 56px; */
    padding: 0 15px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));

    &.hide {
      bottom: -46px;
      padding: 0;

      & .oh-controller-progress-buffered,
      .oh-controller-progress-played {
        border-radius: 0;
      }
    }

    @media only screen and (max-width: 991px) {
      &.hide {
        bottom: -38px;
      }
    }
  `

export const ohcontrollerprogress = (css: Emotion['css']) =>
  css`
    position: relative;
    height: 4px;
    width: 100%;
    background: hsla(0, 0%, 100%, 0.2);
    cursor: pointer;
    border-radius: 2px;

    .oh-controller-progress-buffered,
    .oh-controller-progress-played {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      height: 4px;
      will-change: width;
      transition: all 0.2s ease;
      border-radius: 2px;
    }

    & > .oh-controller-progress-buffered {
      background: hsla(0, 0%, 100%, 0.4);
    }

    & > .oh-controller-progress-played {
      background: var(--primary-color);
    }

    & .oh-controller-progress-played-dot {
      transition: transform 0.2s ease;
      width: 100%;
    }

    & .oh-controller-progress-played-dot::before {
      margin-left: -6px;
      transition: transform 0.3s ease;
      transform: scale(0);
      content: '';
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      height: 0.8em;
      width: 0.8em;
      background: #fff;
      margin-top: -4.5px;
      z-index: 1;
      border-radius: 50%;
      will-change: left;
    }

    & .oh-controller-progress-hit {
      position: absolute;
      left: 0;
      border-radius: 4px;
      padding: 5px 7px;
      background-color: rgba(0, 0, 0, 0.62);
      color: #fff;
      font-size: 12px;
      text-align: center;
      transition: opacity 0.1s ease-in-out;
      word-wrap: normal;
      word-break: normal;
      z-index: 2;
      pointer-events: none;
      transform: translateX(-50%);
      opacity: 0;
      position: absolute;
      bottom: 10px;
    }
  `

export const ohcontrollerbottom = (css: Emotion['css']) =>
  css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    > div {
      display: flex;
      align-items: center;
    }

    & .oh-icon {
      & svg {
        width: 1.3em;
        height: 1.3em;
        fill: currentcolor;
      }

      &.pip {
        transform: scale(1.12);
        margin-right: 1px;
      }

      &.volume {
        transform: scale(1.12);
      }
    }
  `
export const ohcontrollertime = (css: Emotion['css']) =>
  css`
    display: flex;
    align-items: center;
    padding: 0px 0.5em;
    min-width: 100px;
    font-size: 0.875em;
    color: rgba(255, 255, 255, 0.9);
    box-sizing: content-box;
    font-variant-numeric: tabular-nums;
  `

export const dropdown = (css: Emotion['css']) =>
  css`
    position: relative;

    & .expand {
      position: absolute;
      top: 0;
      right: 0px;
      transform: translate(0%, -100%);
      box-sizing: border-box;
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.9);
      color: #fff;
      font-size: 12px;
      visibility: hidden;
      transition: opacity 0.1s ease-in-out;
    }

    &:hover .expand {
      visibility: visible;
    }
  `
export const speeditem = (css: Emotion['css']) =>
  css`
    font-size: 14px;
    display: block;
    padding: 6px 15px;
    text-align: center;
    cursor: pointer;
  `

//TODO:  error TS2742: The inferred type of 'default' cannot be named without a reference to '.pnpm/@emotion+serialize@1.0.4/node_modules/@emotion/serialize'. This is likely not
// export default {
//   ohui,
//   ohmask,
//   oharea,
//   ohplay,
//   ohloading,
//   ohcontrollerwrap,
//   ohcontroller,
//   ohcontrollerprogress,
//   ohcontrollerprogressplayeddot,
//   ohcontrollerprogresshit,
//   ohcontrollerbottom,
//   ohcontrollertime,
//   dropdown,
//   speeditem
// }
