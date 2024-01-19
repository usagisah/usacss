import { Properties, Pseudos } from "csstype"
import { camelToKebab, isPlainObject } from "./helper"
import { AtomRawStyle, AtomStyleClassNames, BaseStyleAction } from "./style.type"
import { getStyleSheet } from "./styleSheet"

export type AtomStyleConfig = {
  [key: string]: {
    [K in keyof Properties]: Properties[K] | { [N in Pseudos | "value"]?: Properties[K] }
  }
}

export type AtomStyleDelete = (key: string, propertyKeys?: string[]) => void

export type AtomStyleAction = BaseStyleAction & {
  style: Record<string, AtomStyleClassNames>
  $delete: AtomStyleDelete
}

export function atomStyle(styleConfig: AtomStyleConfig): AtomStyleAction {
  const sheet = getStyleSheet()
  const style: Record<string, AtomStyleClassNames> = {}
  for (const configKey in styleConfig) {
    const config = styleConfig[configKey]
    const atomRawStyle: AtomRawStyle = {}
    for (const key in config) {
      const _key = camelToKebab(key)
      const val = (config as any)[key]
      if (typeof val === "string") {
        atomRawStyle[_key] = { t: 1, k: _key, v: val }
        continue
      }
      if (!isPlainObject(val)) {
        continue
      }

      for (const stylePropertyKey in val) {
        const stylePropertyVal: string = val[stylePropertyKey]
        if (stylePropertyKey === "value") {
          atomRawStyle[_key] = { t: 1, k: _key, v: stylePropertyVal }
          continue
        }
        atomRawStyle[_key + stylePropertyKey] = { t: 2, k: _key + stylePropertyKey, v: stylePropertyVal }
      }
    }
    style[configKey] = sheet.insertAtom(atomRawStyle)
  }

  const deleteAtom: AtomStyleDelete = (k, pk) => {
    const cls = style[k]
    if (!cls) return

    const _cls: string[] = []
    if (pk) {
      for (const _pk of pk) {
        const c = cls[_pk]
        if (c) _cls.push(c)
      }
    } else {
      _cls.push(...Object.values(cls))
    }
    sheet.deleteAtom(_cls)
  }
  return { t: 1, __$usa_style_: true, style, $delete: deleteAtom }
}
