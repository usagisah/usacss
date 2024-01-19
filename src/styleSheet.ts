import { AtomRawStyle, AtomStyleClassNames, VarRawStyle, VarStyleClassNames } from "./style.type"

export type UStyleSheet = {
  insertAtom(style: AtomRawStyle): AtomStyleClassNames
  insertDepp(style: VarRawStyle): VarStyleClassNames
}

let sheet: UStyleSheet

export function getStyleSheet(): UStyleSheet {
  return sheet
}

export function setStyleSheet(styleSheet: UStyleSheet) {
  sheet = styleSheet
}
