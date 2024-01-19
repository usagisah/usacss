import { Properties, Pseudos } from "csstype"
import { camelToKebab } from "./helper"
import { BaseStyleAction, VarRawStyle, VarStyleClassNames } from "./style.type"
import { UStyleSheet, getStyleSheet } from "./styleSheet"

/* 
varStyle({
  button: {
    select?: [class1, varStyle2],
    var?: {
      customColor: "red",
    },
    width: "100px",
    color: "var(--customColor)",
    ":hover": {
      width: "200px",
      color: "pink"
    }
  }
})
*/

export type DeepStyleConfig = {
  [key: string]: {
    select?: string[]
    var?: Record<string, string>
  } & { [K in keyof Properties | Pseudos]?: K extends keyof Properties ? Properties[K] : string }
}

export type AtomStyleAction = BaseStyleAction & Record<string, VarStyleClassNames>

export function deepStyle(styleConfig: DeepStyleConfig, sheet: UStyleSheet) {
  if (!sheet) {
    sheet = getStyleSheet()
  }
  const cls: Record<string, VarStyleClassNames> = {}
  for (const configKey in styleConfig) {
    const config = styleConfig[configKey]
    const varRawStyle: VarRawStyle = { select: [], pseudos: [], variable: undefined, style: {} }
    for (const key in config) {
      const val = (config as any)[key]
      if (key === "var") {
        varRawStyle.variable = val
        continue
      }
      if (key === "select") {
        varRawStyle.select = val
        continue
      }
      if (key.startsWith(":")) {
        varRawStyle.pseudos.push({ t: 2, v: val })
        continue
      }
      varRawStyle.style[camelToKebab(key)] = val
    }
    cls[configKey] = sheet.insertDepp(varRawStyle)
  }

  const action: AtomStyleAction = { t: 2, __$usa_style_: true, ...cls } as any
  return action
}
