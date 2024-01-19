import { murmurHash } from "./helper"
import { AtomRawStyle, AtomStyleClassNames, DeppRawStyle, DeppStyleClassNames, StringObj } from "./style.type"
import { UStyleSheet } from "./styleSheet"

export interface AtomRule {
  key: string
  hash: string
}

export interface DeepRule {
  el: HTMLStyleElement
  content: string
}

const styleSymbol = "usa-style"
export class ClientStyleSheet implements UStyleSheet {
  atomStyle: HTMLStyleElement
  atomRules: AtomRule[] = []
  deepRules = new Map<string, DeepRule>()

  constructor() {
    const style = document.querySelector(`style[${styleSymbol}]`) as HTMLStyleElement
    if (style) {
      this.atomStyle = style
    } else {
      const { el, append } = this.createStyle({ styleSymbol: "" })
      this.atomStyle = el
      append()
    }
  }

  insertAtom(rawStyle: AtomRawStyle) {
    const result: AtomStyleClassNames = {}
    for (const key in rawStyle) {
      const val = rawStyle[key]
      const rule = this.atomRules.find(r => r.key == val.k)
      if (rule) {
        result[key] = rule.hash
        continue
      }

      const index = this.atomRules.length
      const { k, v } = val
      const hash = "a" + murmurHash(k)
      const content = `.${hash}{${k}:${v}}`
      this.atomRules.push({ key: k, hash })
      this.atomStyle.sheet.insertRule(content, index)
      result[k] = hash
    }
    return result
  }

  deleteAtom(cls: string[]) {
    for (const c of cls) {
      const index = this.atomRules.findIndex(r => r.hash === c)
      if (index > -1) {
        this.atomStyle.sheet.deleteRule(index)
        this.atomRules.splice(index, 1)
      }
    }
  }

  insertDeep(rawStyle: DeppRawStyle): DeppStyleClassNames {
    const { select, style, pseudo } = rawStyle

    let preSelect = ""
    for (const sel of select) {
      preSelect += ` ${sel}`
    }

    const styleContent = this.styleObjToString(style)
    const styleHash = "d" + murmurHash(styleContent)
    let styleRule = this.deepRules.get(styleHash)
    if (!styleRule) {
      const _content = `.${styleHash}${preSelect}{${styleContent}}`
      const { el, append } = this.createStyle({ "data-usa-deep": "" }, _content)
      this.deepRules.set(styleHash, (styleRule = { el, content: _content }))
      append()
    }

    let pseudoFullContent = ""
    let pseudoStyleContent = ""
    for (const { key, val } of pseudo) {
      const str = this.styleObjToString(val)
      pseudoFullContent += str
      pseudoStyleContent += `_##${key}${preSelect}{${str}}`
    }
    const pseudoHash = "d" + murmurHash(pseudoFullContent)
    let pseudoRule = this.deepRules.get(pseudoHash)
    if (!pseudoRule) {
      pseudoStyleContent = pseudoStyleContent.replace(/_##/g, "." + pseudoHash)
      const { el, append } = this.createStyle({ "deep-usa-pseudo": "" }, pseudoStyleContent)
      this.deepRules.set(pseudoHash, (pseudoRule = { el, content: pseudoStyleContent }))
      append()
    }
    return { style: styleHash, pseudo: pseudoHash }
  }

  deleteDeep(cls: string[]) {
    for (const c of cls) {
      const rule = this.deepRules.get(c)
      if (!rule) continue
      rule.el.parentElement.removeChild(rule.el)
      this.deepRules.delete(c)
    }
  }

  createStyle(attrs: StringObj = {}, content = "") {
    const el = document.createElement("style")
    for (const key in attrs) {
      el.setAttribute(key, attrs[key])
    }
    el.innerHTML = content
    return { el, append: () => document.head.appendChild(el) }
  }

  styleObjToString(obj: StringObj, prefix = "") {
    let str = ""
    for (const k in obj) str += `${prefix}${k}:${obj[k]};`
    return str
  }
}
