import { ClientStyleSheet } from "./ClientStyleSheet.js"
import { atomHtmlTag, atomStyleTag, deepHtmlTag, deepStyleTag, hydrateExtractHashReg } from "./constants.js"
import { UsaStyleSheet } from "./style.type.js"

export class HydrateStyleSheet extends ClientStyleSheet implements UsaStyleSheet {
  atomCacheMap = {
    map: [] as string[],
    cur: 0
  }
  deepCacheMap = new Map<string, HTMLStyleElement>()

  constructor() {
    super(false)
    this.#initAtomStyleMap()
    this.#initDeepStyleMap()
    this.#createInsertAtomProxy()
    this.#createInsertDeepProxy()
    setTimeout(() => {
      console.log(this)
    }, 1000)
  }

  #initAtomStyleMap() {
    const atomNode = document.querySelector(`[${atomHtmlTag}]`) as HTMLStyleElement
    if (atomNode && atomNode instanceof HTMLStyleElement) {
      atomNode.removeAttribute(atomHtmlTag)
      atomNode.setAttribute(atomStyleTag, "")
      const res = atomNode.textContent.match(hydrateExtractHashReg)
      const size = atomNode.sheet.cssRules.length
      if (!res || res.length !== size) {
        throw "usacss hydrate fail. The hydrate size does not equal actual rule-size"
      }
      res.forEach(h => this.atomCacheMap.map.push(h))
      this.atomStyle = atomNode
    }
    this.createAtomNode()
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
      return originMethods[name](value, (_, rule) => {
        const { map, cur } = this.atomCacheMap
        const hash = map[cur]
        const { h } = rule
        try {
          if (cur < map.length) {
            if (h !== hash) {
              throw `usacss hydrate fail. The current(${cur}-${hash}) hash is not equal ${h}`
            }
            this.atomHashRules[cur] = h
            this.atomCacheMap.cur++
            return false
          }
        } finally {
          console.log(this.atomCacheMap)
          if (map.length === 0 || cur + 1 >= map.length) {
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
          this.deepCacheMap = null
        }
        return el
      })
    }
    this.insertDeepStyle = proxyMethod.bind(this, "insertDeepStyle") as any
    this.insertDeepRules = proxyMethod.bind(this, "insertDeepRules") as any
  }
}
