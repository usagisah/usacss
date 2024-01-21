import { deepSelectReg, murmurHash } from "./helper"
import { AtomRawStyle, ClientAtomStyleRule, ClientDeepStyleRule, DeppRawStyle, NodeAtomStyleRule, NodeDeepObjRule, StringObj } from "./style.type"
import { UStyleSheet } from "./styleSheet"

export class ClientStyleSheet implements UStyleSheet {
  atomStyle: HTMLStyleElement
  atomRules: ClientAtomStyleRule[] = []
  deepRules = new Map<string, ClientDeepStyleRule>()

  constructor() {
    const { el, append } = this.createStyle({ "data-usa-atom": "" })
    this.atomStyle = el
    append()
  }

  injectRules(target: "atom" | "deep", type: "raw" | "rule", value: any) {
    if (target === "atom") type === "rule" ? this.insertAtomRules(value) : this.insertAtomStyle(value)
    else type === "rule" ? this.insertDeepRules(value) : this.insertDeepStyle(value)
  }

  insertAtomStyle(rawStyle: AtomRawStyle) {
    const { k, v, p = "" } = rawStyle
    const _k = k + p
    const rule = this.atomRules.find(r => r.key == _k)
    if (rule) {
      return rule.hash
    }

    const hash = "a" + murmurHash(_k) + p
    const content = `.${hash}{${k}:${v}}`
    this.atomStyle.sheet.insertRule(content, this.atomRules.length)
    this.atomRules.push({ key: _k, hash })
    return hash
  }

  insertAtomRules(rules: NodeAtomStyleRule[]) {
    const atomRules = this.atomRules
    for (const rule of rules) {
      if (atomRules.length > 0 && atomRules.some(r => r.key === rule.key)) {
        continue
      }
      this.atomStyle.sheet.insertRule(rule.content, this.atomRules.length)
      atomRules.push(rule)
    }
  }

  deleteAtomStyle(cls: string[]) {
    for (const c of cls) {
      const index = this.atomRules.findIndex(r => r.hash === c)
      if (index > -1) {
        this.atomStyle.sheet.deleteRule(index)
        this.atomRules.splice(index, 1)
      }
    }
  }

  insertDeepStyle(rawStyle: DeppRawStyle) {
    const { select, style, pseudo } = rawStyle

    let preSelect = ""
    for (const sel of select) {
      preSelect += ` ${sel}`.replace(deepSelectReg, " .$1")
    }

    const styleContent = this.styleObjToString(style)
    let styleHash = ""
    if (styleContent.length > 0) {
      styleHash = "d" + murmurHash(styleContent)
      if (!this.deepRules.has(styleHash)) {
        const { el, append } = this.createStyle({ "data-usa-deep": "" }, `.${styleHash}${preSelect}{${styleContent}}`)
        this.deepRules.set(styleHash, { el })
        append()
      }
    }

    let pseudoContent = ""
    for (const { key, val } of pseudo) {
      const str = this.styleObjToString(val)
      pseudoContent += `_?_${preSelect}${key}{${str}}`
    }
    let pseudoHash = ""
    if (pseudoContent.length > 0) {
      pseudoHash = "d" + murmurHash(pseudoContent)
      if (!this.deepRules.has(pseudoHash)) {
        const { el, append } = this.createStyle({ "deep-usa-pseudo": "" }, pseudoContent.replace(/_\?_/g, "." + pseudoHash))
        this.deepRules.set(pseudoHash, { el })
        append()
      }
    }
    return (styleHash + " " + pseudoHash).trim()
  }

  insertDeepRules(rules: NodeDeepObjRule) {
    for (const [hash, rule] of rules) {
      if (!this.deepRules.has(hash)) {
        const { el, append } = this.createStyle({ "deep-usa-pseudo": "" }, rule.content)
        this.deepRules.set(hash, { el })
        append()
      }
    }
  }

  deleteDeepStyle(classNames: string[]) {
    for (const item of classNames) {
      for (const cls of item.split(" ")) {
        const rule = this.deepRules.get(cls)
        if (rule) {
          const { el } = rule
          el.parentElement.removeChild(el)
          this.deepRules.delete(cls)
        }
      }
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
