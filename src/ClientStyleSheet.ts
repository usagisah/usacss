import { EmptyFunc, deepSelectReg } from "./helper.js"
import { AtomRawStyle, ClientAtomStyleRule, DeppRawStyle, Hash, NodeAtomStyleRule, NodeDeepStyleRule, StringObj, UStyleSheet } from "./style.type"

export class ClientStyleSheet implements UStyleSheet {
  atomStyle: HTMLStyleElement
  atomRules: ClientAtomStyleRule[] = []

  constructor(public hash: Hash) {
    const { el, append } = this.createStyle({ "data-usa-atom": "" })
    this.atomStyle = el
    append()
  }

  insertAtomStyle(rawStyle: AtomRawStyle) {
    const { k, v, p = "" } = rawStyle
    const key = k + p + v
    const rule = this.atomRules.find(r => (r.key === key))
    if (rule) {
      return rule.hash
    }

    const hash = "a" + this.hash(key)
    const content = `.${hash}${p}{${k}:${v}}`
    this.atomStyle.sheet.insertRule(content, this.atomRules.length)
    this.atomRules.push({ key, hash })
    return hash
  }

  insertAtomRules(rules: NodeAtomStyleRule[]) {
    const style: StringObj = {}
    const atomRules = this.atomRules
    for (const rule of rules) {
      const _rule = atomRules.find(r => r.key === rule.key)
      if (atomRules.length > 0 && _rule) {
        style[rule.key] = _rule.hash
        continue
      }
      this.atomStyle.sheet.insertRule(rule.content, this.atomRules.length)
      style[rule.key] = rule.hash
      atomRules.push(rule)
    }
    return style
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
    const _style: StringObj = {}

    let preSelect = ""
    for (const sel of select) {
      preSelect += ` ${sel}`.replace(deepSelectReg, " .$1")
    }

    let styleContent = this.styleObjToString(style)
    let styleHash = ""
    if (styleContent.length > 0) {
      styleHash = "d" + this.hash()
      styleContent = `.${styleHash}${preSelect}{${styleContent}}`
      _style.value = styleHash
    }

    let pseudoContent = ""
    let pseudoHash = styleHash
    for (const { key, val } of pseudo) {
      const str = this.styleObjToString(val)
      if (str.length === 0) continue
      if (!pseudoHash) pseudoHash = "d" + this.hash()
      pseudoContent += `.${pseudoHash}${preSelect}${key}{${str}}`
      _style[key] = pseudoHash + key
    }

    const content = styleContent + pseudoContent
    if (content.length > 0) {
      const { el, append } = this.createStyle({ "data-usa-deep": "" }, content)
      append()
      return {
        style: _style,
        delete: () => {
          el.parentElement.removeChild(el)
        }
      }
    }
    return { style: _style, delete: EmptyFunc }
  }

  insertDeepRules(rules: NodeDeepStyleRule[]) {
    return rules.map(rule => {
      const { el, append } = this.createStyle({ "data-usa-deep": "" }, rule.content)
      append()
      return {
        style: rule.style,
        delete: () => {
          el.parentElement.removeChild(el)
        }
      }
    })
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
