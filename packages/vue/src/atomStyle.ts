import { AtomStyleConfig, AtomStyleJsonRules, UsaStyleSheet, atomStyle as _atomStyle } from "@usacss/core"
import { inject } from "vue"
import { CSSContext, cssContextKey } from "./context.js"

export function atomStyle(style: AtomStyleConfig) {
  return ((sheet: UsaStyleSheet) => {
    return _atomStyle(style, sheet)
  }) as any as string
}

type UseAtomStyleConfig = AtomStyleConfig | ((sheet: UsaStyleSheet) => any) | Record<string, { r: AtomStyleJsonRules; __$css_rule_: boolean }>

export function useAtomStyle(...configs: UseAtomStyleConfig[]): string {
  const { sheet } = inject<CSSContext>(cssContextKey)
  if (!sheet) throw "[usacss] It seems that there is no registration context"

  const classNames = []
  for (const p of configs as any[]) {
    if ("__$css_rule_" in p) {
      classNames.push(...sheet.insertAtomRules(p.r))
    } else if (typeof p === "function") {
      classNames.push(...[...Object.values(p(sheet))].join(" "))
    } else {
      classNames.push(...[...Object.values(p(sheet))].join(" "))
    }
  }
  return classNames.join(" ")
}
