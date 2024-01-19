export type StringObj = Record<string, string>

export type AtomRawStyle = Record<string, { t: 1; k: string; v: string } | { t: 2; k: string; v: string }>
export type AtomStyleClassNames = Record<string, string>

export type VarRawStyle = { select: string[]; variable?: StringObj; style: StringObj; pseudos: { t: 1 | 2; v: StringObj }[] }
export type VarStyleClassNames = Record<string, { style: Record<string, string>; var: string }>

export type BaseStyleAction = {
  __$usa_style_: boolean
  t: number
}
