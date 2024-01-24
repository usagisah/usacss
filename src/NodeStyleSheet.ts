import { EmptyFunc, deepSelectReg } from "./helper.js"
import { AtomRawStyle, DeppRawStyle, Hash, NodeAtomStyleRule, NodeDeepStyleRule, StringObj, UStyleSheet } from "./style.type"

export class NodeStyleSheet implements UStyleSheet {
  atomRules: NodeAtomStyleRule[] = []
  deepRules: NodeDeepStyleRule[] = []

  constructor(public hash: Hash) {}

  insertAtomStyle(rawStyle: AtomRawStyle) {
    const { k, v, p = "" } = rawStyle
    const key = k + p + v
    const rule = this.atomRules.find(r => (r.key === key))
    if (rule) {
      return rule.hash
    }

    const hash = "a" + this.hash(key)
    const content = `.${hash}${p}{${k}:${v}}`
    this.atomRules.push({ key, hash, content })
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
      style[rule.key] = rule.hash
      atomRules.push(rule)
    }
    return style
  }

  deleteAtomStyle(cls: string[]) {
    for (const c of cls) {
      const index = this.atomRules.findIndex(r => r.hash === c)
      if (index > -1) {
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
      styleContent = `${`.${styleHash}${preSelect}`}{${styleContent}}`
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
      this.deepRules.push({ style: _style, content })
      return {
        style: _style,
        delete: () => {
          const index = this.deepRules.findIndex(v => v.style === _style)
          if (index > -1) this.deepRules.splice(index, 1)
        }
      }
    }
    return { style: _style, delete: EmptyFunc }
  }

  insertDeepRules(rules: NodeDeepStyleRule[]) {
    return rules.map(rule => {
      this.deepRules.push({ ...rule })
      return {
        style: rule.style,
        delete: () => {
          const index = this.deepRules.findIndex(r => r.style === rule.style)
          if (index > -1) this.deepRules.splice(index, 1)
        }
      }
    })
  }

  styleObjToString(obj: StringObj, prefix = "") {
    let str = ""
    for (const k in obj) str += `${prefix}${k}:${obj[k]};`
    return str
  }

  toString() {
    let atomContent = ""
    for (const item of this.atomRules) {
      atomContent += item.content
    }

    let deepContent = ""
    for (const item of this.deepRules) {
      deepContent += item.content
    }

    return atomContent + deepContent
  }

  toJson() {
    return { atom: [...this.atomRules], deep: [...this.deepRules] }
  }
}
