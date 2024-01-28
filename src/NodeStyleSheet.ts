import { atomHtmlTag, deepHtmlTag, deepStyleContentHashReg, deepStyleSelectReg } from "./constants.js"
import { hash } from "./hash.js"
import { styleObjToString } from "./helper.js"
import { AtomRawStyle, AtomStyleDeleteCallback, AtomStyleInsertCallback, AtomStyleJsonRules, AtomStyleRuleMap, DeepStyleInsertCallback, DeepStyleJsonRules, DeepStyleRule, DeepStyleRuleMap, DeppRawStyle, StringObj, UsaStyleSheet } from "./style.type.js"

export class NodeStyleSheet implements UsaStyleSheet {
  atomRules: AtomStyleRuleMap = new Map()
  deepRules: DeepStyleRuleMap = new Map()
  hash = hash

  constructor() {}

  insertAtomStyle(rawStyle: AtomRawStyle, callback?: AtomStyleInsertCallback) {
    const { k, v, p = "" } = rawStyle
    const rawContent = `${p}{${k}:${v};}`

    const rule = this.atomRules.get(rawContent)
    if (rule) {
      return rule.hash
    }

    const hash = "a" + this.hash(rawContent)
    const atomRule = { hash, key: k }
    callback?.(rawContent, atomRule)

    this.atomRules.set(rawContent, atomRule)
    return hash
  }

  insertAtomRules(jsonRules: AtomStyleJsonRules, callback?: AtomStyleInsertCallback) {
    const style: StringObj = {}
    for (const [rawContent, rule] of jsonRules) {
      const { hash, key } = rule
      const _rule = this.atomRules.get(rawContent)
      if (!_rule) {
        callback?.(rawContent, rule)
        this.atomRules.set(rawContent, rule)
      }
      style[key] = hash
    }
    return style
  }

  deleteAtomStyle(cls: string[], callback?: AtomStyleDeleteCallback) {
    const deleteRawContents: string[] = []
    this.atomRules.forEach(({ hash }, rawContent) => {
      if (cls.includes(hash)) {
        deleteRawContents.push(rawContent)
        callback?.(hash)
      }
    })
    deleteRawContents.forEach(k => this.atomRules.delete(k))
  }

  insertDeepStyle(rawStyle: DeppRawStyle, callback?: DeepStyleInsertCallback) {
    const { select, style, pseudo } = rawStyle

    let preSelect = ""
    for (const sel of select) {
      preSelect += ` ${sel}`.replace(deepStyleSelectReg, " .$1")
    }

    let deepStyleRawContent = styleObjToString(style) 
    if (deepStyleRawContent.length > 0) {
      deepStyleRawContent = `._#hash_#${preSelect}{${deepStyleRawContent}}`
    }
    for (const { key, val } of pseudo) {
      const str = styleObjToString(val)
      if (str.length === 0) {
        continue
      }
      deepStyleRawContent += `._#hash_#${preSelect}${key}{${str}}`
    }

    const hash = "d" + this.hash(deepStyleRawContent)
    const rule = this.deepRules.get(hash)
    if (rule) {
      rule.used++
      return hash
    }

    const deepStyleDomContent = deepStyleRawContent.replace(deepStyleContentHashReg, hash)
    const _rule: DeepStyleRule = { content: deepStyleDomContent, used: 1, el: undefined }
    _rule.el = callback?.(hash, _rule)
    this.deepRules.set(hash, _rule)

    return hash
  }

  deleteDeepStyle(cls: (string | { class: string; force: boolean })[]) {
    for (const item of cls) {
      let hash: string
      let force = false
      let rule: DeepStyleRule
      if (typeof item === "string") {
        hash = item
        rule = this.deepRules.get(item)
      } else {
        force = item.force
        hash = item.class
        rule = this.deepRules.get(hash)
      }
      if (!rule) {
        continue
      }
      const { used, el } = rule
      if (force || used <= 1) {
        this.deepRules.delete(hash)
        if (el) {
          el.parentElement.removeChild(el)
          rule.el = undefined
        }
        continue
      }
      rule.used--
    }
  }

  insertDeepRules(jsonRules: DeepStyleJsonRules, callback?: DeepStyleInsertCallback) {
    return jsonRules.map(([hash, rule]) => {
      let _rule = this.deepRules.get(hash)
      if (!_rule) {
        _rule = { el: rule.el, used: 1, content: rule.content }
        _rule.el = callback?.(hash, _rule)
        if (!_rule.el) {
          throw "insertDeepRule fail. The deep-style-dom is not exist"
        }
        this.deepRules.set(hash, _rule)
      } else {
        _rule.used++
      }
      return hash
    })
  }

  toHTMLString() {
    let atomHtml = ""
    this.atomRules.forEach(({ hash }, rawContent) => {
      atomHtml += `.${hash}${rawContent}`
    })
    if (atomHtml.length > 0) {
      atomHtml = `<style ${atomHtmlTag}>${atomHtml}</style>`
    }

    let deepHtml = ""
    this.deepRules.forEach((rule, hash) => {
      deepHtml += `<style ${deepHtmlTag} css="${hash}">${rule.content}</style>`
    })

    return atomHtml + deepHtml
  }

  toString() {
    let styleContent = ""
    this.atomRules.forEach(({ hash }, rawContent) => {
      styleContent += `.${hash}${rawContent}`
    })
    this.deepRules.forEach(rule => {
      styleContent += rule.content
    })
    return styleContent
  }

  toJson() {
    return {
      atomStyle: Array.from(this.atomRules),
      deepStyle: Array.from(this.deepRules)
    }
  }
}
