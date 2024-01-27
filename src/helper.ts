import { StringObj } from "./style.type.js"

export function isPlainObject(v: unknown): v is Record<string, any> {
  return Object.prototype.toString.call(v) === "[object Object]"
}

const _camelToKebabReg = /([a-z])([A-Z])/g
export function camelToKebab(camelCase: string) {
  return camelCase.replace(_camelToKebabReg, "$1-$2").toLowerCase()
}

export function styleObjToString(obj: StringObj, prefix = "") {
  let str = ""
  for (const k in obj) str += `${prefix}${k}:${obj[k]};`
  return str
}

export function createStyle(attrs: StringObj = {}, content = "") {
  const el = document.createElement("style")
  for (const key in attrs) {
    el.setAttribute(key, attrs[key])
  }
  el.innerHTML = content
  return { el, append: () => document.head.appendChild(el) }
}
