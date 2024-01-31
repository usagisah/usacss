import { ClientStyleSheet, NodeStyleSheet, UsaStyleSheet } from "@usacss/core"
import { defineComponent, h, provide, ref } from "vue"

export const cssContextKey = "__$css_provide_"

export interface CSSContext {
  sheet: UsaStyleSheet
}

const isBrowser = () => !!(globalThis.window && globalThis.document)
export type UsacssProvideProps = {
  sheet?: UsaStyleSheet
  hydrate?: boolean
  app: any
  [k: string]: any
}
export const createUsacssProvide = async (props: UsacssProvideProps) => {
  const { sheet, hydrate, app, ..._props } = props
  let _sheet: UsaStyleSheet
  if (sheet) {
    _sheet = sheet
  } else if (hydrate) {
    _sheet = new (await import("@usacss/core")).HydrateStyleSheet()
  } else {
    _sheet = isBrowser() ? new ClientStyleSheet() : new NodeStyleSheet()
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
