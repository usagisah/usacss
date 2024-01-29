import { Properties, Pseudos } from "csstype"
import { camelToKebab } from "./helper.js"
import { BaseStyle, DeppRawStyle, UsaStyleSheet } from "./style.type.js"

export type DeepStyleConfig = ({ select?: string[] } & { [K in keyof Properties]?: Properties[K] } & { [K in Pseudos]?: Properties }) | Record<string, string>
export type DeepStyle = BaseStyle & { className: string }

export function deepStyle(styleConfig: DeepStyleConfig, sheet: UsaStyleSheet): DeepStyle {
  const deepRawStyle: DeppRawStyle = { select: [], pseudo: [], style: {} }
  for (const key in styleConfig) {
    const val = (styleConfig as any)[key]
    if (key === "select") {
      deepRawStyle.select = val
      continue
    }
    if (key.startsWith(":")) {
      deepRawStyle.pseudo.push({ key, val })
      continue
    }
    deepRawStyle.style[camelToKebab(key)] = val
  }
  const className = sheet.insertDeepStyle(deepRawStyle)
  return { t: 2, __$usa_style_: true, className }
}
