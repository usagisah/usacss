import { Properties, Pseudos } from "csstype"
import { StyleRuleType, blankReg, mediaPseudoReg } from "./constants.js"
import { camelToKebab, isPlainObject } from "./helper.js"
import { StringObj, UsaStyleSheet } from "./style.type.js"

export type AtomStyleConfig = {
  [K in keyof Properties]: { value?: Properties[K] } | Properties[K] | { [N in Pseudos]?: Properties[K] } | Record<`@media ${string}` | `@mode ${string}`, Properties[K] | Properties[K]>
}

export type AtomStyleClassNames = Record<string, string>
export function atomStyle(styleConfig: AtomStyleConfig, sheet: UsaStyleSheet): AtomStyleClassNames {
  const ruleType = StyleRuleType.atom
  const atomStyle: StringObj = {}
  for (const styleKey in styleConfig) {
    const _styleKey = camelToKebab(styleKey)

    const styleVal = (styleConfig as any)[styleKey]
    if (typeof styleVal === "string") {
      atomStyle[_styleKey] = sheet.insertAtomStyle({ t: ruleType, k: _styleKey, v: styleVal })
      continue
    }

    if (!isPlainObject(styleVal)) {
      continue
    }
    for (const styleValKey in styleVal) {
      const styleValVal = styleVal[styleValKey]
      if (styleValKey === "value") {
        atomStyle[_styleKey] = sheet.insertAtomStyle({ t: ruleType, k: _styleKey, v: styleValVal })
        continue
      }
      if (styleValKey.startsWith(":")) {
        atomStyle[_styleKey + styleValKey] = sheet.insertAtomStyle({ t: ruleType, p: styleValKey, k: _styleKey, v: styleValVal })
        continue
      }
      if (styleValKey.startsWith("@mode ")) {
        const [mode, pseudo = ""] = styleValKey.slice(6).split(mediaPseudoReg)
        atomStyle[`${styleValKey}-${_styleKey + pseudo}`] = sheet.insertAtomStyle({
          t: ruleType,
          m: mode.trim(),
          k: _styleKey,
          p: pseudo.trim(),
          v: styleValVal
        })
        continue
      }
      if (styleValKey.startsWith("@media ")) {
        const [queryRule, pseudo = ""] = styleValKey.split(mediaPseudoReg)
        atomStyle[`${styleValKey}-${_styleKey + pseudo}`] = sheet.insertAtomStyle({
          t: StyleRuleType.mediaQuery,
          r: queryRule.replace(blankReg, " ").trim(),
          k: _styleKey,
          p: pseudo.trim(),
          v: styleValVal
        })
        continue
      }
    }
  }
  return atomStyle
}
