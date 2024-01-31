import { exec } from "child_process"
import { build } from "esbuild"
import { readFile, rm } from "fs/promises"
import prettyBytes from "pretty-bytes"
import { gzipSync } from "zlib"
import { resolve } from "path"

const args = process.argv.slice(2)
if (args.length === 0) {
  args.push("core", "vite-vue", "vue")
}

const cwd = process.cwd()
for (const name of args) {
  await buildPackage(name)
}


function buildPackage(name) {
  return new Promise(async (success, fail) => {
    const resolvePath = p => resolve(cwd, "packages", name, p)
    const tsconfig = resolvePath("tsconfig.json")
    const input = resolvePath("src/index.ts")
    const outdir = resolvePath("dist")
    console.log( "开始打包", name )

    await rm(outdir, { force: true, recursive: true })
    exec(`tsc -p ${tsconfig} --emitDeclarationOnly --incremental false`, async err => {
      if (err) {
        return fail(err)
      }
      await build({
        entryPoints: [input],
        format: "esm",
        bundle: true,
        platform: "node",
        outdir: outdir,
        tsconfig,
        treeShaking: true,
        minify: true,
        external: ["vue", "esbuild"]
      })
      const file = await readFile(resolve(outdir, "index.js"), "utf-8")
      const fileSize = prettyBytes(file.length)
      const gzipSize = (gzipSync(file, { level: 6 }).byteLength / 1024).toFixed(1)
      console.log(`打包成功: pkg:${name} size:${fileSize} gzip:${gzipSize}kb`)
      success()
    })
  })
}