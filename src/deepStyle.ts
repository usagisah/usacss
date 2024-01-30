import { Properties, Pseudos } from "csstype"
import { camelToKebab } from "./helper.js"
import { DeppRawStyle, UsaStyleSheet } from "./style.type.js"

export type DeepStyleConfig = ({ select?: string } & { [K in keyof Properties]?: Properties[K] } & { [K in Pseudos]?: Properties }) | Record<string, string>

export function deepStyle(styleConfig: DeepStyleConfig, sheet: UsaStyleSheet): string {
  const deepRawStyle: DeppRawStyle = { select: "", pseudo: [], style: {} }
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
  return sheet.insertDeepStyle(deepRawStyle)
}
