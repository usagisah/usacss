import { PropType, defineComponent, h, provide } from "vue"
import { ClientStyleSheet, NodeStyleSheet, UsaStyleSheet, hash } from "../index.js"

export const cssContextKey = "__$css_provide_"

export interface CssProvideContext {
  sheet: UsaStyleSheet
  hydrate: boolean
}

const isBrowser = () => !!(globalThis.window && globalThis.document)
export const UsacssProvide = defineComponent({
  name: "UsacssProvide",
  props: {
    sheet: {
      type: Object as PropType<UsaStyleSheet>,
      required: false
    },
    hydrate: {
      type: Boolean,
      default: false
    },
    app: {
      type: Object as any,
      required: true
    }
  },
  setup(props, { expose }) {
    const { sheet, hydrate } = props
    const _sheet = sheet ?? (isBrowser() ? new ClientStyleSheet(hash) : new NodeStyleSheet(hash))
    provide(cssContextKey, { sheet: _sheet, hydrate })
    expose({ sheet: _sheet })
    return () => {
      return h(props.app)
    }
  }
})

export type UsacssProvideProps = {
  sheet?: UsaStyleSheet
  hydrate?: boolean
  app: any
}
export const createUsacssProvide = (props: UsacssProvideProps) => {
  return h(UsacssProvide, props)
}
