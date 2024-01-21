export type StringObj = Record<string, string>

export type AtomRawStyle = { p?: string, k: string; v: string }

export type DeppRawStyle = { select: string[]; style: StringObj; pseudo: { key: string; val: StringObj }[] }

export type BaseStyleAction = {
  __$usa_style_: boolean
  t: number
}

export type ClientAtomStyleRule = {
  key: string
  hash: string
}

export type NodeAtomStyleRule = {
  key: string
  hash: string
  content: string
}

export type ClientDeepStyleRule = {
  el: HTMLStyleElement
}

export type NodeDeepStyleRule = {
  content: string
}

export type NodeDeepMapRule = { content: string }
export type NodeDeepObjRule = [string, NodeDeepMapRule][]
