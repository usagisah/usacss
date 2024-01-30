import { ShallowRef, inject, onUnmounted, shallowRef } from "vue"
import { DeepStyleConfig, DeepStyleJsonRules, UsaStyleSheet, deepStyle as _deepStyle } from "../index.js"
import { useStyleSheetActions } from "./actions.js"
import { CSSContext, cssContextKey } from "./context.js"

export function deepStyle(style: DeepStyleConfig) {
  return (sheet: UsaStyleSheet) => {
    return _deepStyle(style, sheet)
  }
}

export function useDeepStyle(style: DeepStyleConfig): [ShallowRef<string>, (style: DeepStyleConfig) => void]
export function useDeepStyle(fn: (sheet: UsaStyleSheet) => string): [ShallowRef<string>, (style: DeepStyleConfig) => void]
export function useDeepStyle(rules: { __$css_rule_: boolean; r: DeepStyleJsonRules }): [ShallowRef<string>, (style: DeepStyleConfig) => void]
export function useDeepStyle(p: any) {
  const { sheet } = inject<CSSContext>(cssContextKey)!

  let _delete: Function
  onUnmounted(() => _delete?.())

  const refStyle = shallowRef("")
  const actions = useStyleSheetActions()
  const setStyle = (style: DeepStyleConfig) => {
    if (_delete) _delete()
    const className = _deepStyle(style, sheet)
    _delete = () => actions.deleteDeepStyle([className])
    refStyle.value = className
  }

  if (p.__$css_rule_) {
    refStyle.value = sheet.insertDeepRules(p.r).join(" ")
  } else if (typeof p === "function") {
    refStyle.value = _deepStyle(p, sheet)
  } else {
    setStyle(p)
  }

  return [refStyle, setStyle] as const
}
