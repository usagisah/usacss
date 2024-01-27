import { ShallowRef, inject, onUnmounted, shallowRef } from "vue"
import { DeepStyle, DeepStyleConfig, DeepStyleRule, UsaStyleSheet, deepStyle as _deepStyle } from "../index.js"
import { CssProvideContext, cssContextKey } from "./context.js"
import { useStyleSheetActions } from "./useCssSheet.js"

export function deepStyle(style: DeepStyleConfig) {
  return (sheet: UsaStyleSheet) => {
    return _deepStyle(style, sheet)
  }
}

export function useDeepStyle(style: DeepStyleConfig): [ShallowRef<string>, (style: DeepStyleConfig) => void]
export function useDeepStyle(fn: (sheet: UsaStyleSheet) => DeepStyle): [ShallowRef<string>, (style: DeepStyleConfig) => void]
export function useDeepStyle(rules: { __$css_rule_: boolean; value: DeepStyleRule }): [ShallowRef<string>, (style: DeepStyleConfig) => void]
export function useDeepStyle(p: any) {
  const { sheet } = inject<CssProvideContext>(cssContextKey)!

  let _delete: Function
  onUnmounted(() => _delete?.())

  const refStyle = shallowRef("")
  const actions = useStyleSheetActions()
  const setStyle = (style: DeepStyleConfig) => {
    if (_delete) _delete()
    const _style = _deepStyle(style, sheet)
    _delete = () => actions.deleteDeepStyle([_style.className])
    refStyle.value = _style.className
  }

  if (p.__$css_rule_) {
    sheet.insertDeepRules((refStyle.value = p.value = p.value))
  } else if (typeof p === "function") {
    refStyle.value = _deepStyle(p, sheet).className
  } else {
    setStyle(p)
  }

  return [refStyle, setStyle] as const
}
