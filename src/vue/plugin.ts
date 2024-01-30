import { Plugin } from "vite"
import { NodeStyleSheet } from "../index.js"
import { buildCss } from "./buildCss.js"

function extractId(id: string) {
  const index = id.indexOf("?")
  if (index > -1) id = id.slice(0, index)
  return id
}
const exts = ["js", "jsx", "ts", "tsx"]
const virtualImport = "virtual:usacss"
const cssPlaceholder = "::__:usacss_:_{}\n"
const cssFileName = "/__usacss.css"

export interface UsacssPluginConfig {}

export function UsacssPlugin(config: UsacssPluginConfig = {}): Plugin[] {
  const cssModuleMap = new Map<string, NodeStyleSheet>()
  const transformStyleFile: Plugin["transform"] = async (_, id) => {
    const [__, flag, ext] = id.split(".")
    if (!exts.includes(ext) || flag !== "style") {
      return
    }
    try {
      const res = await buildCss(id, id + ".mjs")
      const fileSheet = new NodeStyleSheet()

      let constantsRuleCode = ""
      for (const exposedName in res) {
        if (exposedName === "default") continue

        const val = res[exposedName]
        if (!(typeof val === "function")) continue

        const fileItemSheet = new NodeStyleSheet()
        val(fileItemSheet)

        const { atomStyle, deepStyle } = fileItemSheet.toJson()
        const ruleCode = JSON.stringify(atomStyle.length > 0 ? atomStyle : deepStyle)
        constantsRuleCode += `export const ${exposedName}={r:${ruleCode},__$css_rule_:true};`

        fileSheet.insertAtomRules(atomStyle)
        fileSheet.insertDeepRules(deepStyle)
      }
      cssModuleMap.set(id, fileSheet)
      return constantsRuleCode
    } catch {}
  }
  const devPlugin: Plugin = {
    name: "usacss:dev",
    apply: "serve",
    resolveId(id) {
      if (id === virtualImport) return cssFileName
    },
    load(id) {
      if (id === cssFileName) return ""
    },
    transform: transformStyleFile
  }
  const buildPlugin: Plugin = {
    name: "usacss:build",
    enforce: "post",
    apply: "build",
    resolveId(id) {
      if (id === virtualImport) return cssFileName
    },
    load(id) {
      if (extractId(id) === cssFileName) {
        return cssPlaceholder
      }
    },
    transform: transformStyleFile,
    generateBundle(_, bundle) {
      const cssFiles = Object.keys(bundle).filter(k => k.endsWith(".css"))
      if (cssFiles.length > 0) {
        const atomCssContent = [...cssModuleMap.values()].map(sheet => sheet.toString()).join("")
        cssFiles.forEach(k => {
          const v = bundle[k]
          if (v.type === "asset" && typeof v.source === "string") {
            v.source = v.source.replace(cssPlaceholder, atomCssContent)
          }
        })
      }
    }
  }
  return [devPlugin, buildPlugin]
}
