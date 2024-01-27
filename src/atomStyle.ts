import { Properties, Pseudos } from "csstype"
import { camelToKebab, isPlainObject } from "./helper.js"
import { BaseStyle, StringObj, UsaStyleSheet } from "./style.type.js"

export type AtomStyleConfig = Record<
  string,
  {
    [K in keyof Properties]: { value?: Properties[K] } | Properties[K] | { [N in Pseudos]?: Properties[K] }
  }
>

export type AtomStyleDelete = (key: string, propertyKeys?: string[]) => void

export type AtomStyle = BaseStyle & {
  style: Record<string, Record<string, string>>
}

export function atomStyle(styleConfig: AtomStyleConfig, sheet: UsaStyleSheet): AtomStyle {
  const groupStyle: Record<string, StringObj> = {}
  for (const groupKey in styleConfig) {
    const group = styleConfig[groupKey]
    const atomStyle: StringObj = {}
    for (const styleKey in group) {
      const _styleKey = camelToKebab(styleKey)

      const styleVal = (group as any)[styleKey]
      if (typeof styleVal === "string") {
        atomStyle[_styleKey] = sheet.insertAtomStyle({ k: _styleKey, v: styleVal })
        continue
      }

      if (!isPlainObject(_styleKey)) {
        continue
      }
      for (const styleValKey in styleVal) {
        const styleValVal: string = styleVal[styleValKey]
        if (styleValKey === "value") {
          atomStyle[_styleKey] = sheet.insertAtomStyle({ k: _styleKey, v: styleValVal })
          continue
        }
        atomStyle[_styleKey + styleValKey] = sheet.insertAtomStyle({ p: styleValKey, k: _styleKey, v: styleValVal })
      }
    }
    groupStyle[groupKey] = atomStyle
  }

  return { t: 1, __$usa_style_: true, style: groupStyle }
}
