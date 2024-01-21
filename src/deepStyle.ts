import { Properties, Pseudos } from "csstype"
import { camelToKebab } from "./helper"
import { BaseStyleAction, DeppRawStyle } from "./style.type"
import { getStyleSheet } from "./styleSheet"

export type DeepStyleConfig = { select?: string[] } & { [K in keyof Properties]?: Properties[K] } & { [K in Pseudos]?: Properties }

export type DeepStyleDelete = () => void
export type DeepStyleAction = BaseStyleAction & { className: string; $delete: DeepStyleDelete }

export function deepStyle(styleConfig: DeepStyleConfig): DeepStyleAction {
  const sheet = getStyleSheet()
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
  const deleteDeep: DeepStyleDelete = () => {
    sheet.deleteDeepStyle([className])
  }

  return { t: 2, __$usa_style_: true, className, $delete: deleteDeep }
}
