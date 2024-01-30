import { NodeStyleSheet } from "./NodeStyleSheet.js"
import { atomStyleTag, deepStyleTag } from "./constants.js"
import { createStyle } from "./helper.js"
import { AtomStyleInsertCallback, DeepStyleInsertCallback, UsaStyleSheet } from "./style.type.js"

export class ClientStyleSheet extends NodeStyleSheet implements UsaStyleSheet {
  atomStyle: HTMLStyleElement
  atomHashRules: string[] = []

  constructor(init = true) {
    super()
    if (init) {
      this.createAtomNode()
    }

    this.insertAtomStyle = this.#createInsertAtom("insertAtomStyle") as any
    this.insertAtomRules = this.#createInsertAtom("insertAtomRules") as any
    this.insertDeepStyle = this.#createInsertDeep("insertDeepStyle") as any
    this.insertDeepRules = this.#createInsertDeep("insertDeepRules") as any
  }

  createAtomNode() {
    const { el, append } = createStyle({ [atomStyleTag]: "" })
    this.atomStyle = el
    append()
    return el
  }

  #createInsertAtom(name: "insertAtomStyle" | "insertAtomRules") {
    return (value: any, callback?: AtomStyleInsertCallback) => {
      return super[name](value, (rawContent, rule) => {
        const res = callback?.(rawContent, rule)
        if (res === false) {
          return
        }
        const { h } = rule
        this.atomStyle.sheet.insertRule(this.atomRuleToContent(rawContent, rule), this.atomHashRules.length)
        this.atomHashRules.push(h)
      })
    }
  }

  deleteAtomStyle(cls: string[]) {
    super.deleteAtomStyle(cls, hash => {
      const index = this.atomHashRules.indexOf(hash)
      this.atomHashRules.splice(index, 1)
      this.atomStyle.sheet.deleteRule(index)
    })
  }

  #createInsertDeep(name: "insertDeepStyle" | "insertDeepRules") {
    return (value: any, callback?: DeepStyleInsertCallback) => {
      return super[name](value, (hash, rule) => {
        let _el = callback?.(hash, rule)
        if (!_el) {
          const { el, append } = createStyle({ [deepStyleTag]: "" }, rule.c)
          _el = el
          append()
        }
        return _el
      })
    }
  }
}
