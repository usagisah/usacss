export type StringObj = Record<string, string>

export type AtomRawStyle = { p?: string; k: string; v: string }

export type DeppRawStyle = { select: string[]; style: StringObj; pseudo: { key: string; val: StringObj }[] }

export type BaseStyleAction = {
  __$usa_style_: boolean
  t: number
}

export type ClientAtomStyleRule = {
  key: string
  hash: string
}

export type NodeAtomStyleRule = {
  key: string
  hash: string
  content: string
}

export type NodeDeepStyleRule = {
  style: StringObj
  content: string
}

export type Hash = (e?: string) => string

export type UStyleSheet = {
  insertAtomStyle(style: AtomRawStyle): string
  insertAtomRules(rules: NodeAtomStyleRule[]): Record<string, string>
  deleteAtomStyle(cls: string[]): void
  insertDeepStyle(style: DeppRawStyle): { style: Record<string, string>; delete: () => void }
  insertDeepRules(rules: NodeDeepStyleRule[]): {
    style: StringObj
    delete: () => void
  }[]
  [x: string]: any
}
