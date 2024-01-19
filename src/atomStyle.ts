import { Properties, Pseudos } from "csstype"
import { camelToKebab, isPlainObject } from "./helper"
import { AtomRawStyle, AtomStyleClassNames, BaseStyleAction } from "./style.type"
import { UStyleSheet, getStyleSheet } from "./styleSheet"

/* 
atomStyle({
  button: {
    fontSize: "14px",
    color: {
      value: "red",
      ":hover": "orange"
    }
  }
})
*/

type AtomStyleConfig = {
  [key: string]: {
    [K in keyof Properties]: Properties[K] | { [N in Pseudos | "value"]?: Properties[K] }
  }
}

export type AtomStyleAction = BaseStyleAction & Record<string, AtomStyleClassNames>

export function atomStyle(styleConfig: AtomStyleConfig, sheet?: UStyleSheet) {
  if (!sheet) {
    sheet = getStyleSheet()
  }
  const cls: Record<string, AtomStyleClassNames> = {}
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
    cls[configKey] = sheet.insertAtom(atomRawStyle)
  }

  const action: AtomStyleAction = { t: 1, __$usa_style_: true, ...cls } as any
  return action
}
