export type StringObj = Record<string, string>

export type AtomRawStyle = { p?: string; k: string; v: string }

export type DeppRawStyle = { select: string[]; style: StringObj; pseudo: { key: string; val: StringObj }[] }

export type BaseStyle = {
  __$usa_style_: boolean
  t: number
}

export type AtomStyleRule = { key: string; hash: string }
export type AtomStyleRuleMap = Map<string, AtomStyleRule>
export type AtomStyleJsonRules = [string, AtomStyleRule][]
export type AtomStyleInsertDom = (rawContent: string, rule: AtomStyleRule) => void
export type AtomStyleDeleteDom = (hash: string) => void

export type DeepStyleRule = { el?: HTMLStyleElement; content?: string; used: number }
export type DeepStyleRuleMap = Map<string, DeepStyleRule>
export type DeepStyleJsonRules = [string, DeepStyleRule][]
export type DeepStyleInsertDom = (rule: DeepStyleRule) => HTMLStyleElement | undefined

export type Hash = (e?: string) => string

export type UsaStyleSheet = {
  insertAtomStyle(style: AtomRawStyle, insertDom?: AtomStyleInsertDom): string
  insertAtomRules(rules: AtomStyleJsonRules, insertDom?: boolean | AtomStyleInsertDom): Record<string, string>
  deleteAtomStyle(cls: string[], callback?: AtomStyleDeleteDom): void
  insertDeepStyle(style: DeppRawStyle, insertDom?: DeepStyleInsertDom): string
  insertDeepRules(rules: DeepStyleJsonRules, insertDom?: boolean | DeepStyleInsertDom): string[]
  deleteDeepStyle(cls: (string | { class: string; force: boolean })[]): void
  toJson(): { atomStyle: AtomStyleJsonRules; deepStyle: DeepStyleJsonRules }
}
