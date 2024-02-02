import { AtomStyleJsonRules, ClientStyleSheet, DeepStyleJsonRules, NodeStyleSheet, UsaStyleSheet } from "@usacss/core"
import { defineComponent, h, provide, ref } from "vue"

export const cssContextKey = "__$css_provide_"

export interface CSSContext {
  sheet: UsaStyleSheet
}

const isBrowser = () => !!(globalThis.window && globalThis.document)
export interface UsacssProvideProps {
  sheet?: UsaStyleSheet
  hydrate?: boolean
  rules?: { atomRules?: AtomStyleJsonRules; deepRules?: DeepStyleJsonRules }
  app: any
  [k: string]: any
}
export const createUsacssProvide = async (props: UsacssProvideProps) => {
  const { sheet, hydrate, app, rules, ..._props } = props
  let _sheet: UsaStyleSheet
  if (sheet) {
    _sheet = sheet
  } else if (hydrate) {
    _sheet = new (await import("@usacss/core")).HydrateStyleSheet()
  } else {
    _sheet = isBrowser() ? new ClientStyleSheet() : new NodeStyleSheet()
  }

  if (rules) {
    const { atomRules, deepRules } = rules
    if (atomRules) _sheet.insertAtomRules(atomRules)
    if (deepRules) _sheet.insertDeepRules(deepRules)
  }

  const sheetRef = ref<UsaStyleSheet>()
  const UsacssProvide = defineComponent({
    name: "UsacssProvide",
    setup(_, { expose }) {
      provide(cssContextKey, { sheet: _sheet })
      expose({ sheet: _sheet })
      sheetRef.value = _sheet
      return () => {
        return h(app)
      }
    }
  })
  return { UsacssProvide: h(UsacssProvide, _props), sheet: _sheet }
}
