import { Properties } from "csstype"
import { StyleRuleType } from "./constants.js"
import { styleObjToString } from "./helper.js"
import { UsaStyleSheet } from "./style.type.js"

export type KeyframesStyleConfig =
  | {
      from: Properties
      to: Properties
    }
  | Record<`${number}%`, Properties>

export function keyframes(name: string, frames: KeyframesStyleConfig, sheet: UsaStyleSheet) {
  let c = ""
  for (const key in frames) {
    c += `${key}{${styleObjToString((frames as any)[key])}}`
  }
  sheet.insertAtomStyle({ t: StyleRuleType.keyframes, r: `@keyframes ${name}`, v: `{${c}}` })
}
