import { $ } from '@oplayer/core'
import { siblings } from '../utils'

export type Setting = {
  name: string
  /**
   * selector 切换下个面板单选 1 ｜ 2 ｜ 3
   * swither  当前面板切换 true or false
   */
  type?: 'selector' | 'switcher'
  children?: Setting[]
  onChange?: Function
  default?: any
  [x: string]: any
}

const activeCls = $.css('display: block;')

const panelCls = $.css`
  width: 200px;
`

const subPanelCls = $.css`
  width: 150px;
`

const settingItemCls = $.css({
  height: '35px',
  cursor: 'pointer',
  color: '#fffc',
  'justify-content': 'space-between',
  'align-items': 'center',
  padding: '0 5px',
  'line-height': '1',
  display: 'flex',
  overflow: 'hidden',

  [`&[data-value='true']`]: {
    'background-color': '#ffffff1a',
    color: '#fff'
  }
})

const switcherCls = $.css({
  display: 'flex',
  height: '100%',
  width: '100%',
  'align-items': 'center',
  'justify-content': 'space-between',

  '& svg': {
    display: 'none',
    width: '18px',
    height: '18px',
    'margin-right': '6px'
  },

  [`&[data-value=true] svg`]: {
    display: 'block'
  }
})

const switcher = (name: string) => `
  <div class="${switcherCls}">
    <span>${name}</span>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#fff"></path>
    </svg>
  </div>
`
const nextOptionCls = $.css({
  display: 'flex',
  height: '100%',
  width: '100%',
  'align-items': 'center',
  'justify-content': 'space-between',

  '& svg': {
    width: '30px',
    height: '30px'
  },

  '& div': {
    display: 'flex',
    'align-items': 'center',

    '& span': {
      'white-space': 'nowrap',
      color: '#ffffff80',
      'margin-right': '5px',
      'font-size': '12px'
    }
  }
})

const nexter = (name: string) => `
  <div class="${nextOptionCls}">
    <span>${name}</span>
    <div>
      <span role="label"></span>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32">
        <path d="m 12.59,20.34 4.58,-4.59 -4.58,-4.59 1.41,-1.41 6,6 -6,6 z" fill="#fff"></path>
      </svg>
    </div>
  </div>
`

function createItem(options: Setting) {
  let $item: HTMLElement = $.create(`div.${settingItemCls}`)
  const res = {
    $: $item,
    $label: undefined as unknown as HTMLElement
  }

  switch (options.type) {
    case 'switcher':
      $item.innerHTML = switcher(options.name)
      $item.setAttribute('data-value', options.default || false)
      $item.children[0]!.setAttribute('data-value', options.default || false)
      break
    default:
      $item.innerHTML = nexter(options.name)
      res['$label'] = $item.querySelector('span[role="label"]')!
      break
  }

  return res
}

function createPanel($panels: HTMLElement[], options: Setting[], sub = false, onChange?: Function) {
  const $panel = $.create(`div.${sub ? subPanelCls : panelCls}`)

  if (!sub) {
    $panel.classList.add(activeCls)
  }

  for (let index = 0; index < options.length; index++) {
    const item = options[index]!
    const { $: $item, $label } = createItem(item)
    $.render($item, $panel)

    $item.addEventListener('click', function () {
      if (item.type == 'switcher') {
        if (sub) {
          this.setAttribute('data-value', 'true')
          this.children[0]!.setAttribute('data-value', 'true')
          siblings(this, () => {
            this.setAttribute('data-value', 'false')
            this.children[0]!.setAttribute('data-value', 'false')
          })
          onChange!(item, index)
        } else {
          const value = this.getAttribute('data-value') == 'true'
          this.setAttribute('data-value', `${!Boolean(value)}`)
          this.children[0]!.setAttribute('data-value', `${!Boolean(value)}`)
          item.onChange?.(!Boolean(value))
        }
      }

      $panel.classList.remove(activeCls)
    })

    if (item.children) {
      if (item.type == 'selector') {
        const selected = item.children.findIndex((_) => _.default) || 0
        if (selected != -1) {
          $label.innerText = item.children[selected]!.name!
          item.onChange?.(item, selected)
        }
      }

      const $nextPanel = createPanel($panels, item.children, true, (...arg: any) => {
        $label.innerText = item.name
        item.onChange?.(...arg)
      })

      $item.onclick = () => {
        $nextPanel.classList.add(activeCls)
      }
    }
  }

  $panels.unshift($panel)

  return $panel
}

export default function (
  $el: HTMLElement,
  options: Setting[] = [
    {
      name: 'Speed',
      type: 'selector',
      onChange(item: any, index: number) {
        console.log(item, index)
      },
      children: [
        {
          type: 'switcher',
          name: '10x',
          value: 10
        }
      ]
    },
    {
      name: 'Speed',
      children: [
        {
          name: '10x',
          children: [
            {
              name: '10x',
              type: 'switcher',
              default: true
            }
          ]
        }
      ]
    },
    {
      name: 'Subtitle',
      type: 'selector',
      onChange(item: any, index: number) {
        console.log(item, index)
      },
      children: [
        {
          type: 'switcher',
          name: 'None'
        },
        {
          type: 'switcher',
          name: 'Chinese',
          default: true
        },
        {
          type: 'switcher',
          name: 'English'
        }
      ]
    }
  ]
) {
  const $dom = $.create(
    `div.${$.css({
      'z-index': '99',
      height: 'auto',
      'max-height': '300px',
      'border-radius': '3px',
      'font-size': '14px',
      transition: 'all .2s',
      display: 'block',
      position: 'absolute',
      bottom: '50px',
      right: '10px',
      overflow: 'auto',
      'backdrop-filter': 'saturate(180%) blur(20px)',
      'background-color': '#000000b3 !important',

      // panel
      '& > div': {
        display: 'none'
      },

      // active panel
      [`& > div.${activeCls}`]: {
        display: 'block'
      }
    })}`,
    {},
    ``
  )

  let $panels: HTMLElement[] = []
  createPanel($panels, options)
  $panels.forEach(($p) => {
    $.render($p, $dom)
  })

  $.render($dom, $el)
}
