import { createUsacssProvide } from "@usacss/vue"
import "element-plus/dist/index.css"
import { createApp } from "vue"
import App from "./App.vue"

createUsacssProvide({ app: App }).then(({ UsacssProvide }) => {
  createApp(UsacssProvide).mount("#app")
})
