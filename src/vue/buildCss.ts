import { BuildOptions, build } from "esbuild"
import { rm } from "fs/promises"

const buildOptions: BuildOptions = {
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["vue", "usacss"]
}

export async function buildCss(input: string, output: string) {
  await build({ ...buildOptions, entryPoints: [input], outfile: output })
  return import(`${output}?t=${new Date().getTime()}`).finally(() => rm(output, { force: true }))
}
