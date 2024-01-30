import { ClientStyleSheet } from "./ClientStyleSheet.js"
import { atomHtmlTag, atomStyleTag, blankReg, deepHtmlTag, deepStyleTag } from "./constants.js"
import { UsaStyleSheet } from "./style.type.js"

export class HydrateStyleSheet extends ClientStyleSheet implements UsaStyleSheet {
  atomCacheMap = new Map<string, number>()
  deepCacheMap = new Map<string, HTMLStyleElement>()

  constructor() {
    super(false)
    this.#initAtomStyleMap()
    this.#initDeepStyleMap()
    this.#createInsertAtomProxy()
    this.#createInsertDeepProxy()
  }

  #initAtomStyleMap() {
    const atomNode = document.querySelector(`[${atomHtmlTag}]`) as HTMLStyleElement
    if (atomNode) {
      if (atomNode instanceof HTMLStyleElement) {
        atomNode.removeAttribute(atomHtmlTag)
        atomNode.setAttribute(atomStyleTag, "")
        Array.from(atomNode.sheet.cssRules).forEach(({ cssText }, index) => {
          this.atomCacheMap.set(cssText.replace(blankReg, ""), index)
        })
        this.atomStyle = atomNode
      } else {
        this.createAtomNode()
      }
    }
  }

  #initDeepStyleMap() {
    const deppNodes: HTMLStyleElement[] = Array.from(document.querySelectorAll(`style[${deepHtmlTag}]`))
    deppNodes.forEach(el => {
      const hash = el.getAttribute("css")
      if (!hash) {
        return
      }
      el.removeAttribute("css")
      el.removeAttribute(deepHtmlTag)
      el.setAttribute(deepStyleTag, "")
      this.deepCacheMap.set(hash, el)
    })
  }

  #createInsertAtomProxy() {
    const originMethods = {
      insertAtomStyle: this.insertAtomStyle,
      insertAtomRules: this.insertAtomRules
    }
    const proxyMethod = (name: "insertAtomStyle" | "insertAtomRules", value: any) => {
      return originMethods[name](value, (rawContent, rule) => {
        const { h } = rule
        try {
          if (this.atomHashRules.includes(h)) {
            return false
          }
          const content = this.atomRuleToContent(rawContent, rule)
          const index = this.atomCacheMap.get(content)
          if (index > -1) {
            this.atomHashRules[index] = h
            this.atomCacheMap.delete(content)
            return false
          }
        } finally {
          if (this.atomCacheMap.size === 0) {
            this.atomCacheMap = null
            this.insertAtomStyle = originMethods.insertAtomStyle
            this.insertAtomRules = originMethods.insertAtomRules
          }
        }
      })
    }
    this.insertAtomStyle = proxyMethod.bind(this, "insertAtomStyle") as any
    this.insertAtomRules = proxyMethod.bind(this, "insertAtomRules") as any
  }

  #createInsertDeepProxy() {
    const originMethods = {
      insertDeepStyle: this.insertDeepStyle,
      insertDeepRules: this.insertDeepRules
    }
    const proxyMethod = (name: "insertDeepStyle" | "insertDeepRules", value: any) => {
      return originMethods[name](value, hash => {
        const el = this.deepCacheMap.get(hash)
        if (el) {
          this.deepCacheMap.delete(hash)
        }
        if (this.deepCacheMap.size === 0) {
          this.insertDeepStyle = originMethods.insertDeepStyle
          this.insertDeepRules = originMethods.insertDeepRules
        }
        return el
      })
    }
    this.insertDeepStyle = proxyMethod.bind(this, "insertDeepStyle") as any
    this.insertDeepRules = proxyMethod.bind(this, "insertDeepRules") as any
  }
}
