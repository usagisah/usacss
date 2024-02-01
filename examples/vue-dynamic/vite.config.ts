import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { UsacssPlugin } from "@usacss/vite-vue"

export default defineConfig({
  plugins: [vue(), UsacssPlugin()]
})
