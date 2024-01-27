import { inject } from "vue"
import { AtomStyle, AtomStyleConfig, AtomStyleRule, UsaStyleSheet, atomStyle as _atomStyle } from "../index.js"
import { CssProvideContext, cssContextKey } from "./context.js"

export function atomStyle(style: AtomStyleConfig) {
  return (sheet: UsaStyleSheet) => {
    return _atomStyle(style, sheet)
  }
}

export function useAtomStyle(style: AtomStyleConfig): Record<string, string>
export function useAtomStyle(fn: (sheet: UsaStyleSheet) => any): Record<string, string>
export function useAtomStyle(rules: Record<string, AtomStyleRule & { __$css_rule_: boolean }>): Record<string, string>
export function useAtomStyle(p: any) {
  const { sheet, hydrate } = inject<CssProvideContext>(cssContextKey)!
  let _style: AtomStyle["style"] = {}

  if (p.__$css_rule_) {
    for (const key in p) {
      if (key === "__$css_rule_") continue
      _style[key] = sheet.insertAtomRules(p[key], hydrate)
    }
  } else if (typeof p === "function") {
    _style = p(sheet).style
  } else {
    _style = _atomStyle(p, sheet).style
  }

  const res: Record<string, string> = {}
  for (const groupKey in _style) {
    res[groupKey] = [...Object.values(_style[groupKey])].join(" ")
  }
  return res
}
