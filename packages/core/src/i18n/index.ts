import type { Lang } from '../types'
import { mergeDeep } from '../utils'
import CN from './zh-CN.json'
import FA from './fa.json'
import PA from './pa.json'
export default class I18n {
  public lang: Lang

  private languages: Partial<Record<Lang, any>> = {
    zh: CN,
    'zh-CN': CN,
    fa: FA,
    pa: PA,
    en: Object.keys(CN).reduce<Record<string, string>>(
      (previous, current) => ((previous[current] = current), previous),
      {}
    )
  }

  constructor(defaultLang: Lang, userLanguages?: Partial<Record<Lang, any>>) {
    this.lang = defaultLang === 'auto' ? (navigator.language as Lang) : defaultLang

    if (userLanguages) {
      mergeDeep(this.languages, userLanguages)
    }

    if (!this.languages[this.lang]) {
      navigator.languages.some((lang) => {
        if (this.languages[lang as Lang]) {
          this.lang = lang as Lang
          return true
        }

        if (lang.indexOf('-') !== -1) {
          const short: Lang = lang.split('-')[0]! as Lang
          if (short && this.languages[short]) {
            this.lang = short
            return true
          }
        }

        return false
      })
    }

    if (!this.languages[this.lang]) this.lang = 'en'
  }

  get(key: string, ...arg: Array<string | number>): string {
    const result = this.languages[this.lang][key]
    if (result == undefined) return key
    let i = 0
    return result.replace(/%s/gi, () => arg[i++] ?? '')
  }

  update(languages: Partial<Record<Lang, any>>): void {
    mergeDeep(this.languages, languages)
  }
}
