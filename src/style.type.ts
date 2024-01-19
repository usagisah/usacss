export type StringObj = Record<string, string>

export type AtomRawStyle = Record<string, { t: 1; k: string; v: string } | { t: 2; k: string; v: string }>
export type AtomStyleClassNames = Record<string, string>

export type DeppRawStyle = { select: string[]; style: StringObj; pseudo: { key: string; val: StringObj }[] }
export type DeppStyleClassNames = { style: string; pseudo: string }

export type BaseStyleAction = {
  __$usa_style_: boolean
  t: number
}
