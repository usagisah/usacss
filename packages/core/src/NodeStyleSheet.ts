import { StyleRuleType, atomHtmlTag, deepHtmlTag, deepStyleContentHashReg, styleContentHashPlaceholder } from "./constants.js"
import { hash } from "./hash.js"
import { styleObjToString } from "./helper.js"
import { AtomRawStyle, AtomStyleDeleteCallback, AtomStyleInsertCallback, AtomStyleJsonRules, AtomStyleRule, AtomStyleRuleMap, DeepStyleInsertCallback, DeepStyleJsonRules, DeepStyleRule, DeepStyleRuleMap, DeppRawStyle, UsaStyleSheet } from "./style.type.js"

export class NodeStyleSheet implements UsaStyleSheet {
  atomRules: AtomStyleRuleMap = new Map()
  deepRules: DeepStyleRuleMap = new Map()
  hash = hash

  insertAtomStyle(rawStyle: AtomRawStyle, callback?: AtomStyleInsertCallback) {
    const { t, r = "", k = "", p = "", v, m } = rawStyle
    let rawContent = ""
    switch (t as any) {
      case StyleRuleType.atom: {
        rawContent = m ? `.${m} ${styleContentHashPlaceholder})${p}{${k}:${v}}` : `.${styleContentHashPlaceholder}${p}{${k}:${v}}`
        break
      }
      case StyleRuleType.keyframes: {
        rawContent = `${r}${v}`
        break
      }
      case StyleRuleType.mediaQuery: {
        rawContent = `${r}{.${styleContentHashPlaceholder}${p}{${k}:${v};}}`
        break
      }
      default: {
        throw "usacss.atom 未知的处理类型"
      }
    }

    const rule = this.atomRules.get(rawContent)
    if (rule) {
      return rule.h
    }

    const hash = "a" + this.hash(rawContent)
    const atomRule: AtomStyleRule = { t, h: hash }
    callback?.(rawContent, atomRule)

    this.atomRules.set(rawContent, atomRule)
    return hash
  }

  insertAtomRules(jsonRules: AtomStyleJsonRules, callback?: AtomStyleInsertCallback) {
    const classNames: string[] = []
    for (const [rawContent, rule] of jsonRules) {
      const { h } = rule
      const _rule = this.atomRules.get(rawContent)
      if (!_rule) {
        callback?.(rawContent, rule)
        this.atomRules.set(rawContent, rule)
      }
      classNames.push(h)
    }
    return classNames
  }

  atomRuleToContent(c: string, { t, h }: AtomStyleRule) {
    switch (t) {
      case StyleRuleType.atom:
        return c.replace(styleContentHashPlaceholder, h)
      case StyleRuleType.keyframes:
        return c
      case StyleRuleType.mediaQuery:
        return c.replace(styleContentHashPlaceholder, h)
    }
  }

  deleteAtomStyle(cls: string[], callback?: AtomStyleDeleteCallback) {
    const deleteRawContents: string[] = []
    this.atomRules.forEach(({ h }, rawContent) => {
      if (cls.includes(h)) {
        deleteRawContents.push(rawContent)
        callback?.(h)
      }
    })
    deleteRawContents.forEach(k => this.atomRules.delete(k))
  }

  insertDeepStyle(rawStyle: DeppRawStyle, callback?: DeepStyleInsertCallback) {
    const { select, style, pseudo } = rawStyle

    let deepStyleRawContent = styleObjToString(style)
    if (deepStyleRawContent.length > 0) {
      deepStyleRawContent = `.${styleContentHashPlaceholder}${select}{${deepStyleRawContent}}`
    }

    for (const { key, val } of pseudo) {
      const str = styleObjToString(val)
      if (str.length === 0) {
        continue
      }
      deepStyleRawContent += `.${styleContentHashPlaceholder}${select}${key}{${str}}`
    }

    const hash = "d" + this.hash(deepStyleRawContent)
    const rule = this.deepRules.get(hash)
    if (rule) {
      rule.u++
      return hash
    }

    const deepStyleDomContent = deepStyleRawContent.replace(deepStyleContentHashReg, hash)
    const _rule: DeepStyleRule = { c: deepStyleDomContent, u: 1, e: undefined }
    _rule.e = callback?.(hash, _rule)
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
      const { u, e } = rule
      if (force || u <= 1) {
        this.deepRules.delete(hash)
        if (e) {
          e.parentElement.removeChild(e)
          rule.e = undefined
        }
        continue
      }
      rule.u--
    }
  }

  insertDeepRules(jsonRules: DeepStyleJsonRules, callback?: DeepStyleInsertCallback) {
    return jsonRules.map(([hash, rule]) => {
      let _rule = this.deepRules.get(hash)
      if (!_rule) {
        _rule = { e: rule.e, u: 1, c: rule.c }
        _rule.e = callback?.(hash, _rule)
        if (!_rule.e) {
          throw "insertDeepRule fail. The deep-style-dom is not exist"
        }
        this.deepRules.set(hash, _rule)
      } else {
        _rule.u++
      }
      return hash
    })
  }

  toHTMLString() {
    let atomHtml = ""
    this.atomRules.forEach((rule, rawContent) => {
      atomHtml += `/*h:${rule.h}*/${this.atomRuleToContent(rawContent, rule)}`
    })
    if (atomHtml.length > 0) {
      atomHtml = `<style ${atomHtmlTag}>${atomHtml}</style>`
    }

    let deepHtml = ""
    this.deepRules.forEach((rule, hash) => {
      deepHtml += `<style ${deepHtmlTag} css="${hash}">${rule.c}</style>`
    })

    return atomHtml + deepHtml
  }

  toString() {
    let styleContent = ""
    this.atomRules.forEach((rule, rawContent) => {
      styleContent += this.atomRuleToContent(rawContent, rule)
    })
    this.deepRules.forEach(rule => {
      styleContent += rule.c
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
