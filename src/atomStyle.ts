import { Properties, Pseudos } from "csstype"
import { camelToKebab, isPlainObject } from "./helper"
import { BaseStyleAction, StringObj } from "./style.type"
import { getStyleSheet } from "./styleSheet"

export type AtomStyleConfig = {
  [key: string]: {
    [K in keyof Properties]: Properties[K] | { [N in Pseudos | "value"]?: Properties[K] }
  }
}

export type AtomStyleDelete = (key: string, propertyKeys?: string[]) => void

export type AtomStyleAction = BaseStyleAction & {
  style: Record<string, Record<string, string>>
  $delete: AtomStyleDelete
}

export function atomStyle(styleConfig: AtomStyleConfig): AtomStyleAction {
  const sheet = getStyleSheet()
  const groupStyle: Record<string, StringObj> = {}

  for (const configKey in styleConfig) {
    const config = styleConfig[configKey]
    const atomStyle: StringObj = {}
    for (const key in config) {
      const _key = camelToKebab(key)
      const val = (config as any)[key]
      if (typeof val === "string") {
        atomStyle[_key] = sheet.insertAtomStyle({ k: _key, v: val })
        continue
      }

      if (!isPlainObject(val)) {
        continue
      }
      for (const stylePropertyKey in val) {
        const stylePropertyVal: string = val[stylePropertyKey]
        if (stylePropertyKey === "value") {
          atomStyle[_key] = sheet.insertAtomStyle({ k: _key, v: stylePropertyVal })
          continue
        }
        atomStyle[_key + stylePropertyKey] = sheet.insertAtomStyle({ p: stylePropertyKey, k: _key, v: stylePropertyVal })
      }
    }
    groupStyle[configKey] = atomStyle
  }

  const deleteAtom: AtomStyleDelete = (k, pk) => {
    const atomStyle = groupStyle[k]
    if (!atomStyle) return

    const _cls: string[] = []
    if (pk) {
      for (const _pk of pk) {
        const c = atomStyle[_pk]
        if (c) _cls.push(c)
      }
    } else {
      _cls.push(...Object.values(atomStyle))
    }
    sheet.deleteAtomStyle(_cls)
  }
  return { t: 1, __$usa_style_: true, style: groupStyle, $delete: deleteAtom }
}
