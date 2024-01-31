import { NodeStyleSheet } from "@usacss/core"
import { Plugin, ViteDevServer } from "vite"
import { buildCss } from "./buildCssFile.js"

function extractId(id: string) {
  const index = id.indexOf("?")
  if (index > -1) id = id.slice(0, index)
  return id
}
const exts = ["js", "jsx", "ts", "tsx"]
const virtualImport = "virtual:usacss"
const cssPlaceholder = "::__:usacss_:_{}\n"
const cssFileName = "/__usacss.css"

function dynamicPlugin(): Plugin {
  const cssModuleMap = new Map<string, NodeStyleSheet>()
  return {
    name: "usacss:dynamic",
    apply: "serve",
    transform: async (_, id) => {
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
  }
}

function staticPlugin(): Plugin[] {
  const connections: { server: ViteDevServer; lastSendTime: number }[] = []
  const cssModuleMap = new Map<
    string,
    {
      fileSheet: NodeStyleSheet
    }
  >()
  const buildStyleContent = () => {
    return [...cssModuleMap.values()].map(({ fileSheet }) => fileSheet.toString()).join("")
  }

  let lastCompileTime = 0
  const transformStyleFile: Plugin["transform"] = async (_, id) => {
    const [__, flag, ext] = id.split(".")
    if (!exts.includes(ext) || flag !== "style") {
      return
    }
    try {
      const res = await buildCss(id, id + ".mjs")
      const fileSheet = new NodeStyleSheet()

      let exportContent = ""
      for (const exposedName in res) {
        if (exposedName === "default") continue

        const fn = res[exposedName]
        if (!(typeof fn === "function")) continue
        const cls = fn(fileSheet)
        exportContent += `export const ${exposedName} = \`${typeof cls === "string" ? cls : Object.values(cls).join(" ")}\`;\n`
      }
      cssModuleMap.set(id, { fileSheet })
      lastCompileTime = new Date().getTime()
      sendUpdateContent()
      return exportContent
    } catch {}
  }

  const sendUpdateContent = function () {
    connections.forEach(item => {
      const { server, lastSendTime } = item
      if (lastCompileTime === lastSendTime) return
      server.ws.send({
        type: "update",
        updates: [
          {
            timestamp: Math.random(),
            acceptedPath: cssFileName,
            path: cssFileName,
            type: "js-update"
          }
        ]
      })
      item.lastSendTime = lastCompileTime
    })
  }

  const devPlugin: Plugin = {
    name: "usacss:static:dev",
    apply: "serve",
    resolveId(id) {
      if (id === virtualImport) return cssFileName
    },
    load(id) {
      const index = id.indexOf("?")
      if (index > -1) {
        id = id.slice(0, index)
      }
      if (id === cssFileName) return buildStyleContent()
    },
    configureServer(server) {
      server.ws.on("connection", () => {
        connections.push({ server, lastSendTime: 0 })
        sendUpdateContent()
      })
      server.ws.on("close", () => {
        connections.splice(
          connections.findIndex(v => v.server === server),
          1
        )
      })
    },
    transform: transformStyleFile
  }
  const buildPlugin: Plugin = {
    name: "usacss:static:build",
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
        const atomCssContent = buildStyleContent()
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

export interface UsacssPluginConfig {
  static?: boolean
}

export function UsacssPlugin(config?: UsacssPluginConfig) {
  const _static = !!config?.static
  return _static ? staticPlugin() : dynamicPlugin()
}
