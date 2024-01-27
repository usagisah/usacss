import { NodeStyleSheet } from "./NodeStyleSheet.js"
import { atomStyleTag, deepStyleTag } from "./constants.js"
import { createStyle } from "./helper.js"
import { AtomRawStyle, AtomStyleInsertDom, AtomStyleJsonRules, DeepStyleJsonRules, DeppRawStyle, Hash } from "./style.type.js"

export class ClientStyleSheet extends NodeStyleSheet {
  atomStyle: HTMLStyleElement
  atomHashRules: string[] = []

  constructor(public hash: Hash) {
    super(hash)
    const { el, append } = createStyle({ [atomStyleTag]: "" })
    this.atomStyle = el
    append()
  }

  insertAtomStyle(rawStyle: AtomRawStyle) {
    return super.insertAtomStyle(rawStyle, (rawContent, { hash }) => {
      this.atomStyle.sheet.insertRule(`.${hash}${rawContent}`, this.atomHashRules.length)
      this.atomHashRules.push(hash)
    })
  }

  insertAtomRules(jsonRules: AtomStyleJsonRules, insertDom: boolean | AtomStyleInsertDom = true) {
    return super.insertAtomRules(jsonRules, (rawContent, { hash }) => {
      if (insertDom === true) {
        this.atomStyle.sheet.insertRule(`.${hash}${rawContent}`, this.atomRules.size)
        this.atomHashRules.push(hash)
      }
    })
  }

  deleteAtomStyle(cls: string[]) {
    super.deleteAtomStyle(cls, hash => {
      const index = this.atomHashRules.indexOf(hash)
      this.atomHashRules.splice(index, 1)
      this.atomStyle.sheet.deleteRule(index)
    })
  }

  insertDeepStyle(rawStyle: DeppRawStyle) {
    return super.insertDeepStyle(rawStyle, rule => {
      const { el, append } = createStyle({ [deepStyleTag]: "" }, rule.content)
      append()
      return el
    })
  }

  insertDeepRules(jsonRules: DeepStyleJsonRules, insertDom: boolean = true) {
    return super.insertDeepRules(jsonRules, rule => {
      if (insertDom) {
        const { el, append } = createStyle({ [deepStyleTag]: "" }, rule.content)
        append()
        return el
      }
    })
  }
}
