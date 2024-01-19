import { murmurHash } from "./hash"
import { AtomRawStyle, AtomStyleClassNames, VarRawStyle, VarStyleClassNames } from "./style.type"
import { UStyleSheet } from "./styleSheet"

interface AtomRule {
  key: string
  val: string
  hash: string
}

const styleSymbol = "usa-style"
export class ClientStyleSheet implements UStyleSheet {
  style: HTMLStyleElement
  atomRules: AtomRule[] = []
  deepRules = new Map<string, any>()

  constructor() {
    const style = document.querySelector(`style[${styleSymbol}]`) as HTMLStyleElement
    if (style) {
      this.style = style
    } else {
      const el = document.createElement("style")
      el.setAttribute(styleSymbol, "")
      document.head.appendChild(el)
      this.style = el
    }
  }

  insertAtom(style: AtomRawStyle) {
    const result: AtomStyleClassNames = {}
    for (const key in style) {
      const val = style[key]
      const rule = this.atomRules.find(r => r.key == val.k)
      if (rule) {
        result[key] = rule.hash
        continue
      }

      const index = this.atomRules.length
      const { k, v } = val
      const hash = "a" + murmurHash(k)
      const content = `.${hash}{${k}:${v}}`
      this.atomRules.push({ key: k, val: v, hash })
      this.style.sheet.insertRule(content, index)
      result[k] = hash
    }
    return result
  }

  insertDepp(style: VarRawStyle) {
    const result: VarStyleClassNames = {}

    return result
  }
}
