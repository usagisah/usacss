import { Properties, Pseudos } from "csstype"
import { camelToKebab } from "./helper"
import { BaseStyleAction, DeppRawStyle, DeppStyleClassNames } from "./style.type"
import { getStyleSheet } from "./styleSheet"

export type DeepStyleConfig = {
  [key: string]: { select?: string[] } & { [K in keyof Properties]?: Properties[K] } & { [K in Pseudos]?: Properties }
}

export type DeepStyleDelete = (key: string) => void
export type DeepStyleAction = BaseStyleAction & { style: Record<string, DeppStyleClassNames>; $delete: DeepStyleDelete }

export function deepStyle(styleConfig: DeepStyleConfig): DeepStyleAction {
  const sheet = getStyleSheet()
  const style: Record<string, DeppStyleClassNames> = {}
  for (const configKey in styleConfig) {
    const config = styleConfig[configKey]
    const deepRawStyle: DeppRawStyle = { select: [], pseudo: [], style: {} }
    for (const key in config) {
      const val = (config as any)[key]
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
    style[configKey] = sheet.insertDeep(deepRawStyle)
  }

  const deleteDeep: DeepStyleDelete = (key: string) => {
    const val = style[key]
    if (!val) return
    sheet.deleteDeep([val.style, val.pseudo])
  }

  return { t: 2, __$usa_style_: true, style, $delete: deleteDeep }
}
