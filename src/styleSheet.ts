import { AtomRawStyle, AtomStyleClassNames, DeppRawStyle, DeppStyleClassNames } from "./style.type"

export type UStyleSheet = {
  insertAtom(style: AtomRawStyle): AtomStyleClassNames
  deleteAtom(cls: string[]): void
  insertDeep(style: DeppRawStyle): DeppStyleClassNames
  deleteDeep(cls: string[]): void
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
