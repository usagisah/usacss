import { deepSelectReg, murmurHash } from "./helper"
import { AtomRawStyle, DeppRawStyle, NodeAtomStyleRule, NodeDeepMapRule, NodeDeepObjRule, StringObj } from "./style.type"
import { UStyleSheet } from "./styleSheet"

export class NodeStyleSheet implements UStyleSheet {
  atomRules: NodeAtomStyleRule[] = []
  deepRules = new Map<string, NodeDeepMapRule>()

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
    this.atomRules.push({ key: _k, hash, content })
    return hash
  }

  insertAtomRules(rules: NodeAtomStyleRule[]) {
    const atomRules = this.atomRules
    for (const rule of rules) {
      if (atomRules.length > 0 && atomRules.some(r => r.key === rule.key)) {
        continue
      }
      atomRules.push(rule)
    }
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

    let preSelect = ""
    for (const sel of select) {
      preSelect += ` ${sel}`.replace(deepSelectReg, " .$1")
    }

    const styleContent = this.styleObjToString(style)
    let styleHash = ""
    if (styleContent.length > 0) {
      styleHash = "d" + murmurHash(styleContent)
      if (!this.deepRules.has(styleHash)) {
        this.deepRules.set(styleHash, { content: `.${styleHash}${preSelect}{${styleContent}}` })
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
        this.deepRules.set(pseudoHash, { content: pseudoContent.replace(/_\?_/g, "." + pseudoHash) })
      }
    }
    return (styleHash + " " + pseudoHash).trim()
  }

  insertDeepRules(rules: NodeDeepObjRule) {
    for (const [hash, rule] of rules) {
      if (!this.deepRules.has(hash)) {
        this.deepRules.set(hash, { content: rule.content })
      }
    }
  }

  deleteDeepStyle(classNames: string[]) {
    for (const item of classNames) {
      for (const cls of item.split(" ")) {
        this.deepRules.delete(cls)
      }
    }
  }

  styleObjToString(obj: StringObj, prefix = "") {
    let str = ""
    for (const k in obj) str += `${prefix}${k}:${obj[k]};`
    return str
  }

  atomStyleToString() {
    let str = ""
    for (const item of this.atomRules) {
      str += item.content
    }
    return str
  }

  deepStyleToString() {
    let str = ""
    this.deepRules.forEach(item => (str += item.content))
    return str
  }

  styleToString() {
    return this.atomStyleToString() + this.deepStyleToString()
  }

  styleToJson() {
    return { atom: [...this.atomRules], deep: Array.from(this.deepRules) }
  }
}
