import { Plugin } from "vite"
import { AtomRawStyle, AtomStyle, BaseStyle, DeepStyle, NodeStyleSheet, hash } from "../index.js"
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
      const fileSheet = new NodeStyleSheet(hash)

      const mapAtomRulesToCode = ({ style }: AtomStyle, itemSheet: FileItemStyleSheet) => {
        let code = ""
        for (const groupKey in style) {
          const groupRules: any[] = []
          for (const hash of Object.values(style[groupKey])) {
            groupRules.push(itemSheet.getAtomRule(hash))
          }
          code += `"${groupKey}":${JSON.stringify(groupRules)},\n`
        }
        return code
      }
      const mapDeepRulesToCode = ({ className }: DeepStyle, itemSheet: FileItemStyleSheet) => {
        return `value:${JSON.stringify(itemSheet.deepRules.get(className))}`
      }

      let constantsRuleCode = ""
      for (const exposedName in res) {
        if (exposedName === "default") continue

        const val = res[exposedName]
        if (!(typeof val === "function")) continue

        const fileItemSheet = new FileItemStyleSheet()

        const cssStyle: BaseStyle = val(fileSheet)
        const code = cssStyle.t === 1 ? mapAtomRulesToCode(cssStyle as any, fileItemSheet) : mapDeepRulesToCode(cssStyle as any, fileItemSheet)
        constantsRuleCode += `export const ${exposedName}={\n${code}__$css_rule_:true\n};`

        const { atomStyle, deepStyle } = fileItemSheet.toJson()
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
      debugger
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

class FileItemStyleSheet extends NodeStyleSheet {
  atomHashMap = new Map()

  constructor() {
    super(hash)
  }

  insertAtomStyle(rawStyle: AtomRawStyle): string {
    return super.insertAtomStyle(rawStyle, (k, { hash }) => {
      this.atomHashMap.set(hash, k)
    })
  }

  getAtomRule(hash: string) {
    return this.atomRules.get(this.atomHashMap.get(hash))
  }
}
