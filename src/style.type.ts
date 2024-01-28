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
export type AtomStyleInsertCallback = (rawContent: string, rule: AtomStyleRule) => boolean | void
export type AtomStyleDeleteCallback = (hash: string) => void

export type DeepStyleRule = { el?: HTMLStyleElement; content?: string; used: number }
export type DeepStyleRuleMap = Map<string, DeepStyleRule>
export type DeepStyleJsonRules = [string, DeepStyleRule][]
export type DeepStyleInsertCallback = (hash: string, rule: DeepStyleRule) => HTMLStyleElement | undefined

export type Hash = (e?: string) => string

export type UsaStyleSheet = {
  insertAtomStyle(style: AtomRawStyle, callback?: AtomStyleInsertCallback): string
  insertAtomRules(rules: AtomStyleJsonRules, callback?: AtomStyleInsertCallback): Record<string, string>
  deleteAtomStyle(cls: string[], callback?: AtomStyleDeleteCallback): void
  insertDeepStyle(style: DeppRawStyle, callback?: DeepStyleInsertCallback): string
  insertDeepRules(rules: DeepStyleJsonRules, callback?: DeepStyleInsertCallback): string[]
  deleteDeepStyle(cls: (string | { class: string; force: boolean })[]): void
  toJson(): { atomStyle: AtomStyleJsonRules; deepStyle: DeepStyleJsonRules }
  toString(): string
  toHTMLString(): string
}
