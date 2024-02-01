import { createUsacssProvide } from "@usacss/vue"
import "element-plus/dist/index.css"
import { createSSRApp } from "vue"
import App from "./App.vue"

createUsacssProvide({ app: App, hydrate: true }).then(({ UsacssProvide }) => {
  const app = createSSRApp(UsacssProvide)
  app.mount("#app")
})
