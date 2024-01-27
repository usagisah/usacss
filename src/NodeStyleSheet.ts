import { deepStyleContentHashReg, deepStyleSelectReg } from "./constants.js"
import { styleObjToString } from "./helper.js"
import { AtomRawStyle, AtomStyleDeleteDom, AtomStyleInsertDom, AtomStyleJsonRules, AtomStyleRuleMap, DeepStyleInsertDom, DeepStyleJsonRules, DeepStyleRule, DeepStyleRuleMap, DeppRawStyle, Hash, StringObj, UsaStyleSheet } from "./style.type.js"

export class NodeStyleSheet implements UsaStyleSheet {
  atomRules: AtomStyleRuleMap = new Map()
  deepRules: DeepStyleRuleMap = new Map()

  constructor(public hash: Hash) {}

  insertAtomStyle(rawStyle: AtomRawStyle, insertDom?: AtomStyleInsertDom) {
    const { k, v, p = "" } = rawStyle
    const rawContent = `${p}{${k}:${v}}`

    const rule = this.atomRules.get(rawContent)
    if (rule) {
      return rule.hash
    }

    const hash = "a" + this.hash(rawContent)
    const atomRule = { hash, key: k }
    insertDom?.(rawContent, atomRule)

    this.atomRules.set(rawContent, atomRule)
    return hash
  }

  insertAtomRules(jsonRules: AtomStyleJsonRules, insertDom: boolean | AtomStyleInsertDom = false) {
    const style: StringObj = {}
    for (const [rawContent, rule] of jsonRules) {
      const { hash, key } = rule
      const _rule = this.atomRules.get(rawContent)
      if (!_rule) {
        if (typeof insertDom === "function") {
          insertDom(rawContent, rule)
        }
        this.atomRules.set(rawContent, rule)
      }
      style[key] = hash
    }
    return style
  }

  deleteAtomStyle(cls: string[], callback?: AtomStyleDeleteDom) {
    const deleteRawContents: string[] = []
    this.atomRules.forEach(({ hash }, rawContent) => {
      if (cls.includes(hash)) {
        deleteRawContents.push(rawContent)
        callback?.(hash)
      }
    })
    deleteRawContents.forEach(k => this.atomRules.delete(k))
  }

  insertDeepStyle(rawStyle: DeppRawStyle, insertDom?: DeepStyleInsertDom) {
    const { select, style, pseudo } = rawStyle

    let preSelect = ""
    for (const sel of select) {
      preSelect += ` ${sel}`.replace(deepStyleSelectReg, " .$1")
    }

    let deepStyleRawContent = styleObjToString(style)
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
    _rule.el = insertDom?.(_rule)
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

  insertDeepRules(jsonRules: DeepStyleJsonRules, insertDom: boolean | DeepStyleInsertDom = false) {
    return jsonRules.map(([hash, rule]) => {
      let _rule = this.deepRules.get(hash)
      if (!_rule) {
        let _el = rule.el
        _rule = { el: _el, used: 0, content: rule.content }

        if (!_el && typeof insertDom === "function") {
          _rule.el = insertDom(_rule)
        }
        this.deepRules.set(hash, _rule)
      }
      return hash
    })
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

  // toHTMLString() {
  //   let html = ""
  //   this.atomRules.forEach(({ hash }, rawContent) => {
  //     styleContent += `.${hash}${rawContent}`
  //   })
  //   this.deepRules.forEach(rule => {
  //     styleContent += rule.content
  //   })
  // }

  toJson() {
    return {
      atomStyle: Array.from(this.atomRules),
      deepStyle: Array.from(this.deepRules)
    }
  }
}
