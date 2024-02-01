import { StyleRuleType } from "./constants.js"

export type StringObj = Record<string, string>

export type AtomRawStyle = { t: StyleRuleType; r?: string; k?: string; v: string; p?: string; m?: string }

export type DeppRawStyle = { select: string; style: StringObj; pseudo: { key: string; val: StringObj }[] }

export type AtomStyleRule = { t: StyleRuleType; h: string }
export type AtomStyleRuleMap = Map<string, AtomStyleRule>
export type AtomStyleJsonRules = [string, AtomStyleRule][]
export type AtomStyleInsertCallback = (rawContent: string, rule: AtomStyleRule) => boolean | void
export type AtomStyleDeleteCallback = (hash: string) => void

export type DeepStyleRule = { e?: HTMLStyleElement; c?: string; u: number }
export type DeepStyleRuleMap = Map<string, DeepStyleRule>
export type DeepStyleJsonRules = [string, DeepStyleRule][]
export type DeepStyleInsertCallback = (hash: string, rule: DeepStyleRule) => HTMLStyleElement | undefined

export type Hash = (e?: string) => string

export type UsaStyleSheet = {
  insertAtomStyle(style: AtomRawStyle, callback?: AtomStyleInsertCallback): string
  insertAtomRules(rules: AtomStyleJsonRules, callback?: AtomStyleInsertCallback): string[]
  deleteAtomStyle(cls: string[], callback?: AtomStyleDeleteCallback): void
  insertDeepStyle(style: DeppRawStyle, callback?: DeepStyleInsertCallback): string
  insertDeepRules(rules: DeepStyleJsonRules, callback?: DeepStyleInsertCallback): string[]
  deleteDeepStyle(cls: (string | { class: string; force: boolean })[]): void
  toJson(): { atomStyle: AtomStyleJsonRules; deepStyle: DeepStyleJsonRules }
  toString(): string
  toHTMLString(): string
}
