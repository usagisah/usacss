import { Properties, Pseudos } from "csstype"
import { camelToKebab } from "./helper.js"
import { BaseStyleAction, DeppRawStyle, UStyleSheet } from "./style.type"

export type DeepStyleConfig = { select?: string[] } & { [K in keyof Properties]?: Properties[K] } & { [K in Pseudos]?: Properties }

export type DeepStyleDelete = () => void
export type DeepStyleAction = BaseStyleAction & { style: Record<string, string>; $delete: DeepStyleDelete }

export function deepStyle(styleConfig: DeepStyleConfig, sheet: UStyleSheet): DeepStyleAction {
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
  const res = sheet.insertDeepStyle(deepRawStyle)
  return { t: 2, __$usa_style_: true, style: res.style, $delete: res.delete }
}
