import { AtomRawStyle, DeppRawStyle } from "./style.type"

export type UStyleSheet = {
  insertAtomStyle(style: AtomRawStyle): string
  deleteAtomStyle(cls: string[]): void
  insertDeepStyle(style: DeppRawStyle): string
  deleteDeepStyle(cls: string[]): void
  injectRules(target: "atom" | "deep", type: "raw" | "rule", value: any): void
  [x: string]: any
}

let sheet: UStyleSheet

export function getStyleSheet(): UStyleSheet {
  if (!sheet) throw "usacss 尚未初始化"
  return sheet
}

export function setStyleSheet(styleSheet: UStyleSheet) {
  sheet = styleSheet
}
