import { createUsacssProvide } from "@usacss/vue"
import { renderToWebStream } from "vue/server-renderer"
import App from "./App.vue"
import { createSSRApp } from "vue"

export async function render() {
  const { UsacssProvide, sheet } = await createUsacssProvide({ app: App })
  const stream = renderToWebStream(createSSRApp(UsacssProvide), {})
  return { stream, sheet }
}
